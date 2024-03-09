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
        filtered_games = list(filter(lambda game: game.uuid == message.get("gameId"), games))
        if not filtered_games:
            await self.channel_layer.group_send(self.game_group_name, {"type": "start_game", "message": message})
        if filtered_games:
            await self.channel_layer.group_send(self.game_group_name, {"type": "continue_game", "message": message})
       
        if message["input"]:
            await self.channel_layer.group_send(self.game_group_name, {"type": "check_guess", "message": message})
        



    async def check_guess(self, event):
        message = event["message"]
        current_game = list(filter(lambda game: str(game.uuid) == message.get("gameId"), games))[0]
        current_guess = "".join(message.get("input"))
        current_player = list(filter(lambda player: str(player.uuid) == message.get("playerId"), current_game.players))[0]
        if not current_game.guess(str(current_player.uuid), current_guess):
            await self.send(text_data=json.dumps({"message": {"category": "warning", "content": "not a word"}}))
        else:
            await self.send(text_data=json.dumps({"success": {"success": "awesome", "points": current_player.points}, "points": current_player.points}))



    async def continue_game(self, event):
        print("continue game")
        pass







        

    async def start_game(self, event):
        message = event["message"]
        game = Game(message.get("gameId"))
        player = Player(message.get("playerName"), message.get("playerId"))
        game.add_player(player)
        games.append(game)
        print(games)
        # Send message to WebSocket
        await self.send(text_data=json.dumps({"letters": game.letterset}))