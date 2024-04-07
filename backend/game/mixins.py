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
    async def update_game(self, event):
        game = event["game"]
        id = event["id"]
        feedback = json.dumps(self.translate_game_object(game, player_id=id))
        await self.send(text_data=feedback)

