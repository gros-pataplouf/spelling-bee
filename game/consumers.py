import json
from channels.layers import get_channel_layer
from channels.generic.websocket import AsyncWebsocketConsumer
from .game import Game, Player, UniqueException

games = []
user_groups = {}

class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.game_uuid = self.scope["url_route"]["kwargs"]["game_uuid"]
        self.user_uuid = self.scope["query_string"].decode("utf-8")
        print("new user joined", self.user_uuid)
        self.game_group_name = f"game_uuid_{self.game_uuid}"
        self.user_group_name = f"user_uuid_{self.user_uuid}"
        # Join game group
        await self.channel_layer.group_add(self.game_group_name, self.channel_name)
        await self.channel_layer.group_add(self.user_group_name, self.channel_name)
        user_groups[self.user_uuid] = self.user_group_name
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.game_group_name, self.channel_name)

    # Receive message from WebSocket
    async def receive(self, text_data):
        channel_layer = get_channel_layer()
        print(channel_layer)
        text_data_json = json.loads(text_data)
        message = text_data_json
        filtered_games = list(filter(lambda game: game.uuid == message.get("gameId"), games))
        if not filtered_games:
            await self.channel_layer.group_send(self.user_group_name, {"type": "start_game", "message": message})
        if filtered_games :
            print(filtered_games)
            await self.channel_layer.group_send(self.user_group_name, {"type": "continue_game", "message": message})
        if message["input"]:
            await self.channel_layer.group_send(self.user_group_name, {"type": "check_guess", "message": message})

    async def check_guess(self, event):
        message = event["message"]
        current_game = list(filter(lambda game: game.uuid == message.get("gameId"), games))[0]
        current_guess = "".join(message.get("input"))
        current_player = list(filter(lambda player: player.uuid == message.get("player1Id"), current_game.players))[0]
        current_opponent = None
        if len(current_game.players) > 1:
            current_opponent = list(filter(lambda player: player.uuid != message.get("player1Id"), current_game.players))[0]
        guess_result = current_game.guess(current_player.uuid, current_guess)
        print(guess_result)
        await self.channel_layer.group_send(self.user_group_name, {'type': 'update_game', 'message': json.dumps({
                "player1Points": current_player.points,
                "player1GuessedWords": current_player.guessed_words,
                "message": {"category": "result", "content": guess_result["message"], "points": guess_result["points"] if guess_result["points"] > 0 else None},
                "player2Points": current_opponent.points if current_opponent else None,
                "player2GuessedWords": current_opponent.guessed_words if current_opponent else None,
                "letters": current_game.letterset
                })})

        if current_opponent:
            print("sending to opponent")
            await self.channel_layer.group_send(user_groups[current_opponent.uuid], {'type': 'update_game', 'message': json.dumps({
                "player1Points": current_opponent.points,
                "player1GuessedWords": current_opponent.guessed_words,
                "player2Points": current_player.points,
                "player2GuessedWords": current_player.guessed_words,
                "letters": current_game.letterset
                })})


    async def start_game(self, event):
        message = event["message"]
        game = Game(message.get("gameId"))
        player = Player(message.get("player1Name"), message.get("player1Id"))
        game.add_player(player)
        games.append(game)
        # Send message to WebSocket
        await self.send(text_data=json.dumps({"letters": game.letterset}))
    
    async def update_game(self, event):
        message = event["message"]
        await self.send(text_data=message)
    
    async def continue_game(self, event):
        message = event["message"]
        game = list(filter(lambda game: game.uuid == message.get("gameId"), games))[0]
        current_player_list = list(filter(lambda player: player.uuid == message.get("player1Id"), game.players))
        if not current_player_list: #if the joining user is not yet playing
            new_player = game.add_player(Player(message.get('player1Name')+'2', message.get('player1Id'))) #add them to game
            playing_opponent = list(filter(lambda player: player.uuid != message.get("player1Id"), game.players))[0]
            await self.channel_layer.group_send(user_groups[new_player.uuid], {'type': 'update_game', 'message': json.dumps({
                "player1Points": new_player.points,
                "player1GuessedWords": new_player.guessed_words,
                "player2Points": playing_opponent.points if playing_opponent else None,
                "player2GuessedWords": playing_opponent.guessed_words if playing_opponent else None,
                "letters": game.letterset
                })})

        else:
            current_player = current_player_list[0]
            playing_opponent_list = list(filter(lambda player: player.uuid != message.get("player1Id"), game.players))
            playing_opponent = playing_opponent_list[0] if playing_opponent_list else None
            await self.channel_layer.group_send(user_groups[current_player.uuid], {'type': 'update_game', 'message': json.dumps({
                "player1Points": current_player.points,
                "player1GuessedWords": current_player.guessed_words,
                "player2Points": playing_opponent.points if playing_opponent else None,
                "player2GuessedWords": playing_opponent.guessed_words if playing_opponent else None,
                "letters": game.letterset
                })})



            


