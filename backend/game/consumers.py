import json
from uuid import uuid4
from channels.generic.websocket import AsyncWebsocketConsumer
from .game import Game, Player

games = []
user_groups = {}


class QueryConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
    async def receive(self, text_data):
        message = json.loads(text_data)
        filtered_games = list(filter(lambda game: game.uuid == message.get("gameId"), games))
        self.temp_user_group = "group_" + str(uuid4())
        await self.channel_layer.group_add(self.temp_user_group, self.channel_name)
        if not filtered_games:
            await self.channel_layer.group_send(self.temp_user_group, {"type": "game_info", "message": {"phaseOfGame": "error", "message": {"category": "result", "content": "game does not exist", "points": None}}})
        else:
            await self.close()
    async def disconnect(self, close_code):
        pass
    async def game_info(self, event):
        print("handling game info")
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
