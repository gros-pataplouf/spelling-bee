import json
from uuid import uuid4
from channels.generic.websocket import AsyncWebsocketConsumer
from .game import Game, Player

games = []
user_groups = {}


class QueryConsumer(AsyncWebsocketConsumer):
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
                self.temp_user_group, {
                    "type": "game_info",
                    "message": {
                        "phaseOfGame": "error",
                        "message": {"category": "result", "content": "game does not exist", "points": None}}})
        elif filtered_games and not filtered_games[0].multiplayer and message.get("player1Id") != filtered_games[0].players[0].uuid:
            await self.channel_layer.group_send(
                self.temp_user_group, {
                    "type": "game_info",
                    "message": {
                        "phaseOfGame": "error",
                        "message": {"category": "result", "content": "game already full", "points": None}}})
        elif filtered_games:
            await self.channel_layer.group_send(self.temp_user_group, {"type": "game_info", "message": {"phaseOfGame": filtered_games[0].status, "multiPlayer": filtered_games[0].multiplayer}})

        
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
