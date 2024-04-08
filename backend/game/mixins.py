import json
from .game import Game, Player

class GameMixin:
    """
    things shared by Gameconsumer and QueryConsumer
    """
    error_messages = {
            "not_ex": "game does not exist", 
            "full": "game already full"
            }

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
 
    
    def get_game(self, game_id, games):
        filtered_games = list(filter(lambda game: game.uuid == game_id, games))
        if filtered_games:
            return filtered_games[0]
        return None
    
    def get_player(self, player_id, game):
        filtered_players = list(filter(lambda player: player.uuid == player_id, game.players))
        if filtered_players:
            return filtered_players[0]
        return None
    
    def get_opponent(self, player_id, game):
        filtered_players = list(filter(lambda player: player.uuid != player_id, game.players))
        if filtered_players:
            return filtered_players[0]
        return None

    def translate_game_object(self, game: Game, player_id):
        player = self.get_player(player_id, game)
        opponent = self.get_opponent(player_id, game)

        return {
                "gameId": game.uuid,
                "gameTimeStamp": game.timeout,
                "letters": game.letterset,
                "phaseOfGame": game.status,
                "player1Id": player.uuid,
                "player1Name": player.name,
                "player1GuessedWords": player.guessed_words,
                "player1Points": player.points,
                "multiPlayer": game.multiplayer,
                "player2Id": opponent.uuid if opponent else None,
                "player2Name": opponent.name if opponent else None,
                "player2GuessedWords": opponent.guessed_words if opponent else None,
                "player2Points": opponent.points if opponent else None
            }
    async def update_game(self, event):
        game = event["game"]
        id = event["id"]
        feedback = json.dumps(self.translate_game_object(game, player_id=id))
        await self.send(text_data=feedback)

