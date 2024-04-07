import json
from uuid import uuid4
from channels.generic.websocket import AsyncWebsocketConsumer
from .game import Game, Player

games = []
user_groups = {}

ERROR_MESSAGES = {
    "not_ex": "game does not exist", 
    'full': "game already full"
}

class GameConsumer(AsyncWebsocketConsumer):


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
        if not filtered_games:
            await self.channel_layer.group_send(self.user_group_name, {"type": "start_game", "message": message})
        elif filtered_games and message.get("phaseOfGame") == "joining":
            await self.channel_layer.group_send(self.user_group_name, {"type": "join_game", "message": message})

    async def join_game(self, event):
        message = event["message"]
        game = list(filter(lambda g: g.uuid == message.get("gameId"), games))[0]
        player = Player(message.get("player1Name") or "Testplayer", message.get("player1Id"))
        game.add_player(player)
        feedback = json.dumps(self.translate_game_object(game, player_id=player.uuid))
        await self.send(text_data=feedback)


    async def start_game(self, event):
        message = event["message"]
        game = Game(message.get("gameId"))
        player = Player(message.get("player1Name"), message.get("player1Id"))
        game.add_player(player, multiplayer=message.get("multiPlayer"))
        games.append(game)
        feedback = json.dumps(self.translate_game_object(game, player_id=player.uuid))
        print(feedback)
        await self.send(text_data=feedback)

    def translate_game_object(self, game: Game, player_id):
        def get_player(id, opponent=False) -> Player:
            if not opponent:
                filtered_players = list(filter(lambda p: p.uuid == id, game.players))
                return filtered_players[0] if filtered_players else None
            else:
                filtered_players = list(filter(lambda p: p.uuid != id, game.players))
                return filtered_players[0] if filtered_players else None
        player1 = get_player(player_id)
        player2 = get_player(player_id, opponent=True)

        return {
                "gameId": game.uuid,
                "gameTimeStamp": game.timeout,
                "letters": game.letterset,
                "phaseOfGame": game.status,
                "player1Id": player1.uuid,
                "player1Name": player1.name,
                "player1GuessedWords": player1.guessed_words,
                "player1Points": player1.points,
                "multiPlayer": game.multiplayer,
                "player2Id": player2.uuid if player2 else None,
                "player2Name": player2.name if player2 else None,
                "player2GuessedWords": player2.guessed_words if player2 else None,
                "player2Points": player2.points if player2 else None
            }





class QueryConsumer(AsyncWebsocketConsumer):

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
                    self.temp_user_group, self.generate_error_message(ERROR_MESSAGES["full"]))
            elif len(requested_game.players) > 1 and not plays_game:
                await self.channel_layer.group_send(
                    self.temp_user_group, self.generate_error_message(ERROR_MESSAGES["full"]))
            elif requested_game.multiplayer and not plays_game:
                await self.channel_layer.group_send(self.temp_user_group, self.generate_status_message(requested_game, status="joining"))
            else:
                await self.channel_layer.group_send(self.temp_user_group, self.generate_status_message(requested_game))
        else:
            await self.channel_layer.group_send(
                self.temp_user_group, self.generate_error_message(ERROR_MESSAGES["not_ex"]))

        
    async def disconnect(self, close_code):
        if self.temp_user_group:
            await self.channel_layer.group_discard(self.temp_user_group, self.channel_name)

    async def game_info(self, event):
        message =  json.dumps(event["message"])
        await self.send(text_data=message)

