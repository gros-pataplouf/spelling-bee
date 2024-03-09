import json

from channels.generic.websocket import AsyncWebsocketConsumer
from .game import Game, Player

games = []

class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.game_uuid = self.scope["url_route"]["kwargs"]["game_uuid"]
        self.game_group_name = f"game_uuid_{self.game_uuid}"
        # Join room group
        await self.channel_layer.group_add(self.game_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(self.game_group_name, self.channel_name)

    # Receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json
        filtered_games = list(filter(lambda game: game.get("gameId") == message.get("gameId"), games))
        if not filtered_games:
            await self.channel_layer.group_send(self.game_group_name, {"type": "start_game", "message": message}
        )

    async def start_game(self, event):
        message = event["message"]
        game = Game(message.get("gameId"))
        player = Player(message.get("playerName"), message.get("playerId"))
        # Send message to WebSocket
        await self.send(text_data=json.dumps({"letters": game.letterset}))