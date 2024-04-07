import json
from uuid import uuid4
from channels.generic.websocket import AsyncWebsocketConsumer
from .game import Game, Player
from .mixins import GameMixin

games = []
user_groups = {}




class GameConsumer(AsyncWebsocketConsumer, GameMixin):

    async def connect(self):
        self.game_uuid = self.scope["path"].strip("/")
        self.user_uuid = self.scope["query_string"].decode("utf-8")
        try:
            print("try validating player")
            Player.validate_uuid(self.user_uuid)
            self.user_group_name = f"user_uuid_{self.user_uuid}"
            print(self.user_group_name)
            user_groups[self.user_uuid] = self.user_group_name
            await self.channel_layer.group_add(self.user_group_name, self.channel_name)
            await self.accept()
        except ValueError:
            await self.close()

    async def disconnect(self, close_code):
        print("running disconnect", close_code)
        await self.channel_layer.group_discard(self.user_group_name, self.channel_name)
        print("user group discarded")
    
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json
        filtered_games = list(filter(lambda game: game.uuid == message.get("gameId"), games))
        if not filtered_games and message.get("phaseOfGame") != "inviting":
            print("starting game")
            await self.channel_layer.group_send(self.user_group_name, {"type": "start_game", "message": message})
        elif filtered_games and message.get("phaseOfGame") == "joining":
            await self.channel_layer.group_send(self.user_group_name, {"type": "join_game", "message": message})
        elif filtered_games and message.get("phaseOfGame") == "playing":
            requested_game = filtered_games[0]
            requesting_player_uuid = message.get("player1Id")
            await self.channel_layer.group_send(self.user_group_name, {"type": "update_game", "game": requested_game, "id": requesting_player_uuid })

    async def join_game(self, event):
        message = event["message"]
        game = list(filter(lambda g: g.uuid == message.get("gameId"), games))[0]
        player = Player(message.get("player1Name") or "Testplayer", message.get("player1Id"))
        opponent: Player = game.players[0]
        game.add_player(player)
        # update all players that game starts
        player_group = user_groups[player.uuid]
        opponent_group = user_groups[opponent.uuid]
        await self.channel_layer.group_send(opponent_group, {"type": "update_game", "game": game, "id": opponent.uuid})
        await self.channel_layer.group_send(player_group, {"type": "update_game", "game": game, "id": player.uuid})
    
    async def start_game(self, event):
        message = event["message"]
        game = Game(message.get("gameId"))
        player = Player(message.get("player1Name"), message.get("player1Id"))
        game.add_player(player, multiplayer=message.get("multiPlayer"))
        games.append(game)
        feedback = json.dumps(self.translate_game_object(game, player_id=player.uuid))
        print(feedback)
        await self.send(text_data=feedback)






class QueryConsumer(AsyncWebsocketConsumer, GameMixin):

    def generate_error_message(self, text):
        template = {
                    "type": "game_info",
                    "message": {
                        "phaseOfGame": "error",
                        "message": {"category": "result", "content": text, "points": None}}}
        return template
    
    def generate_status_message(self, game, status=None):
        template = {"type": "game_info", "message": {"phaseOfGame": status or game.status, "multiPlayer": game.multiplayer}}
        return template


    async def connect(self):
        self.temp_user_group = None
        await self.accept()
    
    async def receive(self, text_data):
        message = json.loads(text_data)
        requested_game_id = message.get("gameId")
        filtered_games = list(filter(lambda game: game.uuid == requested_game_id, games))
        [requested_game, all_player_uuids, requesting_player_uuid, plays_game] = [None for i in range(4)]
        self.temp_user_group = "group_" + str(uuid4())
        
        await self.channel_layer.group_add(self.temp_user_group, self.channel_name)
        
        if filtered_games:
            requested_game = filtered_games[0]
            all_player_uuids = [p.uuid for p in requested_game.players]
            requesting_player_uuid = message.get("player1Id")
            plays_game = requesting_player_uuid in all_player_uuids
            
            if not requested_game.multiplayer and not plays_game:
                await self.channel_layer.group_send(
                    self.temp_user_group, self.generate_error_message(self.error_messages["full"]))
            elif len(requested_game.players) > 1 and not plays_game:
                await self.channel_layer.group_send(
                    self.temp_user_group, self.generate_error_message(self.error_messages["full"]))
            elif requested_game.multiplayer and not plays_game:
                await self.channel_layer.group_send(self.temp_user_group, self.generate_status_message(requested_game, status="joining"))
            else:
                print(requested_game, requesting_player_uuid)
                await self.channel_layer.group_send(self.temp_user_group, {"type": "update_game", "game": requested_game, "id": requesting_player_uuid})
        else:
            await self.channel_layer.group_send(
                self.temp_user_group, self.generate_error_message(self.error_messages["not_ex"]))

        
    async def disconnect(self, close_code):
        if self.temp_user_group:
            await self.channel_layer.group_discard(self.temp_user_group, self.channel_name)

    async def game_info(self, event):
        message =  json.dumps(event["message"])
        await self.send(text_data=message)

