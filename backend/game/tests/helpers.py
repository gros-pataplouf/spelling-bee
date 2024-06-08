import re

def is_valid_uuid(input):
    uuid_regex = re.compile("[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}")
    return uuid_regex.match(input)

def create_game_state( #a game state message as the client would send it
        gameId: str,
        player1Id: str,
        multiPlayer: bool = False,
        guess: str = None,
        secondsLeft: int = 0,
        letters: list = list(7*"?"),
        input: list = [],
        player1GuessedWords: list = [],
        phaseOfGame: str = "irrelevant",
        player1Points: int = 0, 
        player1Name: str = "test",
        message: dict = {},
        player2Name: str = "test2",
        player2Id: str = None,
        player2GuessedWords: list = [],
        player2Points: int = 0):
    return {
        "gameId": gameId,
        "secondsLeft": secondsLeft,
        "letters": letters,
        "phaseOfGame": phaseOfGame,
        "player1Id": player1Id,
        "player1Name": player1Name,
        "player1GuessedWords": player1GuessedWords,
        "player1Points": player1Points,
        "input": input,
        "message": message,
        "multiPlayer": multiPlayer,
        "player2Id": player2Id,
        "player2Name": player2Name,
        "player2GuessedWords": player2GuessedWords,
        "player2Points": player2Points,
        "guess": guess
}