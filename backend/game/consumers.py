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
        if filtered_games:
            queried_game = filtered_games[0]
            if len(queried_game.players) == 1:
                self.temp_user_group = "group_" + str(uuid4()) 
                print(queried_game.players[0].name)
                await self.channel_layer.group_add(self.temp_user_group, self.channel_name)
                await self.channel_layer.group_send(self.temp_user_group, {"type": "game_info", "message": {"phaseOfGame": "joining", "player2Name": queried_game.players[0].name}})
        else:
            await self.close()
    async def game_info(self, event):
        print("handling game info")
        message =  json.dumps(event["message"])
        await self.send(text_data=message)
    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.temp_user_group, self.channel_name)

class GameConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.game_uuid = self.scope["url_route"]["kwargs"]["game_uuid"]
        self.user_uuid = self.scope["query_string"].decode("utf-8")
        print("user joined", self.user_uuid)
        self.game_group_name = f"game_uuid_{self.game_uuid}"
        self.user_group_name = f"user_uuid_{self.user_uuid}"
        # Join game group
        await self.channel_layer.group_add(self.game_group_name, self.channel_name)
        await self.channel_layer.group_add(self.user_group_name, self.channel_name)
        user_groups[self.user_uuid] = self.user_group_name
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.game_group_name, self.channel_name)

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json
        print(message)
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
                "letters": current_game.letterset,
                "input": [] if guess_result["points"] > 0 else message.get("input")
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
        already_playing = game.players
        for player in already_playing:
            if player.uuid == message.get("player1Id"):
                player.name = message.get("player1Name")
        current_player_list = list(filter(lambda player: player.uuid == message.get("player1Id"), game.players))
        if not current_player_list: #if the joining user is not yet playing
            new_player = game.add_player(Player(message.get('player1Name') or "dummy", message.get('player1Id'))) #add them to game
            playing_opponent = list(filter(lambda player: player.uuid != message.get("player1Id"), game.players))[0]
            await self.channel_layer.group_send(user_groups[new_player.uuid], {'type': 'update_game', 'message': json.dumps({
                "player1Points": new_player.points,
                "player1GuessedWords": new_player.guessed_words,
                "player1Name": new_player.name,
                "player2Points": playing_opponent.points if playing_opponent else None,
                "player2Id": playing_opponent.uuid if playing_opponent else None,
                "player2Name": playing_opponent.name if playing_opponent else None,
                "player2GuessedWords": playing_opponent.guessed_words if playing_opponent else None,
                "letters": game.letterset,
                "multiPlayer": True if playing_opponent else False
                })})
            print("opponent", playing_opponent.name)
            await self.channel_layer.group_send(user_groups[playing_opponent.uuid], {'type': 'update_game', 'message': json.dumps({
                "player1Points": playing_opponent.points,
                "player1GuessedWords": playing_opponent.guessed_words,
                "player1Name": playing_opponent.name,
                "player2Points": new_player.points if playing_opponent else None,
                "player2GuessedWords": new_player.guessed_words if playing_opponent else None,
                "player2Id": new_player.uuid,
                "player2Name": new_player.name,
                "letters": game.letterset,
                "multiPlayer": True if playing_opponent else False

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