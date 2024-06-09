import json
from uuid import uuid4
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.exceptions import DenyConnection
from game.game import Game
from game.helpers import GameAdapter
from game.player import Player
from game.mixins import GameMixin
from core.security import RateLimiter


games = []
user_groups = {}
throttler = RateLimiter(1, 2, 10)

class GameConsumer(AsyncWebsocketConsumer, GameMixin):
    @throttler.throttle
    async def connect(self):
        self.game_uuid = self.scope["path"].strip("/")
        self.user_uuid = self.scope["query_string"].decode("utf-8")
        try:
            Player.validate_uuid(self.user_uuid)
            self.user_group_name = f"user_uuid_{self.user_uuid}"
            user_groups[self.user_uuid] = self.user_group_name
            await self.channel_layer.group_add(self.user_group_name, self.channel_name)
            await self.accept()
        except ValueError:
            await self.close()

    async def disconnect(self, close_code):
        try:
            await self.channel_layer.group_discard(self.user_group_name, self.channel_name)
        except Exception as e:
            print(e)
    
    @throttler.throttle
    async def receive(self, text_data):
        if len(text_data) > self.MAX_PAYLOAD:
            raise DenyConnection
        text_data_json = json.loads(text_data)
        message = text_data_json
        game = self.get_game(message.get("gameId"), games)
        requesting_player_uuid = message.get("player1Id")
        if message.get("phaseOfGame") == "discarded":
            await self.channel_layer.group_send(self.user_group_name, {"type": "end_game", "game": GameAdapter(game), "id": requesting_player_uuid })
        elif game and message.get("input"):
                await self.channel_layer.group_send(self.user_group_name, {"type": "check_guess", "message": message})
        elif not game and message.get("phaseOfGame") != "inviting":
            await self.channel_layer.group_send(self.user_group_name, {"type": "start_game", "message": message})
        elif game and message.get("phaseOfGame") == "joining":
            await self.channel_layer.group_send(self.user_group_name, {"type": "join_game", "message": message})
        elif game and message.get("phaseOfGame") == "playing":
            requesting_player_uuid = message.get("player1Id")
            await self.channel_layer.group_send(self.user_group_name, {"type": "update_game", "game": GameAdapter(game), "id": requesting_player_uuid })

    async def end_game(self, event):
        game = self.get_game(event["game"].uuid, games)
        id = event["id"]
        opponent_to_notify = self.get_opponent(id, game)
        if opponent_to_notify:
            message =  {
            "category": "error",
            "content": f"{self.get_player(id, game).name} has ended the game",
            "points": None}
        
            game.status = "error"
            await self.channel_layer.group_send(
                    user_groups[opponent_to_notify.uuid],
                    {"type": "update_game",
                    "game": GameAdapter(game),
                    "id": opponent_to_notify.uuid      
            })

            await self.channel_layer.group_send(
                    user_groups[opponent_to_notify.uuid],
                    {"type": "send_message",
                    "message": message        
            })
        game.discard()


    async def join_game(self, event):
        message = event["message"]
        game = self.get_game(message.get("gameId"), games)
        player = Player(message.get("player1Name") or "Testplayer", message.get("player1Id"))
        opponent: Player = game.players[0]
        game.observers.append(self)
        game.add_player(player)
        # update all players that game starts
        player_group = user_groups[player.uuid]
        opponent_group = user_groups[opponent.uuid]
        await self.channel_layer.group_send(opponent_group, {"type": "update_game", "game": GameAdapter(game), "id": opponent.uuid})
        await self.channel_layer.group_send(player_group, {"type": "update_game", "game": GameAdapter(game), "id": player.uuid})
    
    async def start_game(self, event):
        message = event["message"]
        game = Game(message.get("gameId"))
        player = Player(message.get("player1Name"), message.get("player1Id"))
        old_games = list(filter(lambda g: player.uuid in [p.uuid for p in g.players], games))
        for old in old_games:
            old.discard()

        game.observers.append(self)
        game.add_player(player, multiplayer=message.get("multiPlayer"))
        games.append(game)
        feedback = json.dumps(self.translate_game_object(GameAdapter(game), player_id=player.uuid))
        await self.send(text_data=feedback)
    
    async def check_guess(self, event):
        message = event["message"]
        game = self.get_game(message.get("gameId"), games)
        guess = "".join(message.get("input"))
        player = self.get_player(message.get("player1Id"), game)
        opponent = self.get_opponent(message.get("player1Id"), game)
        guess_result = game.guess(player.uuid, guess)
        message_for_player = {
            "category": "result",
            "content": guess_result["message"],
            "points": guess_result["points"] if guess_result["points"] > 0 else None
        }

        await self.channel_layer.group_send(self.user_group_name, {'type': 'send_message', "message": message_for_player, "reset_input": guess_result["points"] > 0})
        await self.channel_layer.group_send(self.user_group_name, {'type': 'update_game', 'game': GameAdapter(game), 'id': player.uuid})
        if opponent:
             await self.channel_layer.group_send(user_groups[opponent.uuid], {'type': 'update_game', 'game': GameAdapter(game), 'id': opponent.uuid})
    
    async def send_message(self, event):
        message = {"message": event["message"]}
        if event.get("reset_input"):
            message["input"] = []
        await self.send(text_data=json.dumps(message))





class QueryConsumer(AsyncWebsocketConsumer, GameMixin):
    @throttler.throttle
    async def connect(self):
        self.temp_user_group = None
        await self.accept()
    
    async def receive(self, text_data):
        if len(text_data) > self.MAX_PAYLOAD:
            raise DenyConnection
        message = json.loads(text_data)
        game = self.get_game(message.get("gameId"), games)

        [all_player_uuids, requesting_player_uuid, plays_game] = [None for i in range(3)]
        self.temp_user_group = "group_" + str(uuid4())
        
        await self.channel_layer.group_add(self.temp_user_group, self.channel_name)
        
        if game:
            all_player_uuids = [p.uuid for p in game.players]
            requesting_player_uuid = message.get("player1Id")
            plays_game = requesting_player_uuid in all_player_uuids
            
            if not game.multiplayer and not plays_game:
                await self.channel_layer.group_send(
                    self.temp_user_group, self.generate_error_message(self.error_messages["full"]))
            elif len(game.players) > 1 and not plays_game:
                await self.channel_layer.group_send(
                    self.temp_user_group, self.generate_error_message(self.error_messages["full"]))
            elif game.multiplayer and not plays_game:
                await self.channel_layer.group_send(self.temp_user_group, self.generate_status_message(game, status="joining"))
            else:
                await self.channel_layer.group_send(self.temp_user_group, {"type": "update_game", "game": GameAdapter(game), "id": requesting_player_uuid})
        else:
            await self.channel_layer.group_send(
                self.temp_user_group, self.generate_error_message(self.error_messages["not_ex"]))

        
    async def disconnect(self, close_code):
        if self.temp_user_group:
            await self.channel_layer.group_discard(self.temp_user_group, self.channel_name)

    async def game_info(self, event):
        message =  json.dumps(event["message"])
        await self.send(text_data=message)

