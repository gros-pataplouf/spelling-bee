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
        self.temp_user_group = "group_" + str(uuid4())
        await self.channel_layer.group_add(self.temp_user_group, self.channel_name)
        if not filtered_games:
            await self.channel_layer.group_send(
                self.temp_user_group, self.generate_error_message(ERROR_MESSAGES["not_ex"]))
        elif filtered_games and not filtered_games[0].multiplayer and message.get("player1Id") != filtered_games[0].players[0].uuid:
            await self.channel_layer.group_send(
                self.temp_user_group, self.generate_error_message(ERROR_MESSAGES["full"]))
        elif filtered_games and len(filtered_games[0].players) > 1 and message.get("player1Id") not in [p.uuid for p in filtered_games[0].players]:
            await self.channel_layer.group_send(
                 self.temp_user_group, self.generate_error_message(ERROR_MESSAGES["full"]))
        elif filtered_games and filtered_games[0].multiplayer and message.get("player1Id") not in [p.uuid for p in filtered_games[0].players]:
            await self.channel_layer.group_send(self.temp_user_group, self.generate_status_message(filtered_games[0], status="joining"))
        elif filtered_games:
            await self.channel_layer.group_send(self.temp_user_group, self.generate_status_message(filtered_games[0]))

        
    async def disconnect(self, close_code):
        if self.temp_user_group:
            await self.channel_layer.group_discard(self.temp_user_group, self.channel_name)

    async def game_info(self, event):
        message =  json.dumps(event["message"])
        await self.send(text_data=message)

class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

    async def disconnect(self, close_code):
        pass

    
    async def receive(self, text_data):
        pass

            
    async def game_info(self, event):
        pass
