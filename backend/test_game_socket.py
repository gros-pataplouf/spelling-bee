
import pytest, os, django, re, json
from game.consumers import GameConsumer, QueryConsumer, games
from game.game import Player, Game
from uuid import uuid4
from channels.testing import WebsocketCommunicator

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.dev')

django.setup()

def create_game_state( #a game state message as the client would send it
        gameId: str,
        player1Id: str,
        multiPlayer: bool = False,
        guess: str = None,
        gameTimeStamp: int = 0,
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
        "gameTimeStamp": gameTimeStamp,
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


@pytest.fixture
def player():
    return Player("Plouf", uuid4())

@pytest.fixture
def monoplayer_game():
    new_player = Player("Plouf", uuid4())
    monoplayer_game = Game(timeout=10)
    monoplayer_game.add_player(new_player)
    games.append(monoplayer_game)
    return monoplayer_game

@pytest.fixture
def multiplayer_game():
    new_player = Player("Plouf", uuid4())
    multiplayer_game = Game(timeout=10)
    multiplayer_game.add_player(new_player, multiplayer=True)
    games.append(multiplayer_game)
    return multiplayer_game


def is_valid_uuid(self, input):
    uuid_regex = re.compile("[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}")
    return uuid_regex.match(str(input))


"""
The Game Consumer:
if no game with gameId => create one and send details (mono, multi)
elif "guess" => analyze guess and send feedback
elif game with game id => send current state
"""

@pytest.mark.asyncio
async def test_rejects_invalid_player_id():
    new_player_id = "not_a_valid_uuid"
    communicator = WebsocketCommunicator(GameConsumer.as_asgi(), f"ws://localhost/{uuid4()}?{new_player_id}")
    connected, subprotocol = await communicator.connect()
    assert not connected

@pytest.mark.asyncio
async def test_accepts_valid_player_id():
    new_player_id = str(uuid4())
    communicator = WebsocketCommunicator(GameConsumer.as_asgi(), f"ws://localhost/{uuid4()}?{new_player_id}")
    connected, subprotocol = await communicator.connect()
    assert connected

@pytest.mark.asyncio
async def test_creates_new_game_if_not_exists_mono():
    num_of_games = len(games)
    new_game_id = str(uuid4())
    new_player_id = str(uuid4())
    communicator = WebsocketCommunicator(GameConsumer.as_asgi(), f"ws://localhost/{new_game_id}?{new_player_id}")
    connected, subprotocol = await communicator.connect()
    assert connected
    await communicator.send_to(text_data=json.dumps(create_game_state(new_game_id, new_player_id)))
    response = await communicator.receive_from()
    assert len(games) == num_of_games + 1
    assert json.loads(response)["phaseOfGame"] == "playing"
    assert json.loads(response)["letters"] == ['A', 'E', 'L', 'M', 'S', 'T', 'X']
    await communicator.disconnect()
