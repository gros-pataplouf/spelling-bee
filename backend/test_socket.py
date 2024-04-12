
import pytest, os, django, re, json
from time import sleep
from game.consumers import GameConsumer, QueryConsumer, games
from game.game import Player, Game, message_reference
from uuid import uuid4
from channels.testing import WebsocketCommunicator
from game.mixins import GameMixin


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.dev')
django.setup()

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

@pytest.fixture
def player():
    yield Player("Plouf", uuid4())

@pytest.fixture
def monoplayer_game():
    new_player = Player("Plouf", uuid4())
    monoplayer_game = Game()
    monoplayer_game.add_player(new_player)
    games.append(monoplayer_game)
    yield monoplayer_game

@pytest.fixture
def multiplayer_game():
    new_player = Player("Plouf", uuid4())
    multiplayer_game = Game()
    multiplayer_game.add_player(new_player, multiplayer=True)
    games.append(multiplayer_game)
    yield multiplayer_game


def is_valid_uuid(self, input):
    uuid_regex = re.compile("[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}")
    return uuid_regex.match(str(input))


#connection to both query and game endpoint works
#send uuid to query consumer, returns phase of game

"""
The Query Consumer:
if no game with gameId => error message
if game, not multi, one player => compare playerId. continue if matches. error message if not matches. 
if game, multi, one player => compare playerId with player in game. if matches, keep 'waiting'. else, send 'joining' message to joining player
if game, multi, two players => compare playerId with players in game. if none matches, send error message. 
"""


@pytest.mark.asyncio
async def test_query_ws_returns_error_if_not_exists():
    communicator = WebsocketCommunicator(QueryConsumer.as_asgi(), "ws://localhost/query")
    connected, subprotocol = await communicator.connect()
    assert connected
    await communicator.send_to(text_data=json.dumps({"gameId": "fake"}))
    response = await communicator.receive_from()
    assert json.loads(response) == {"phaseOfGame": "error", "message": {"category": "result", "content": GameMixin.error_messages["not_ex"], "points": None}}
    await communicator.disconnect()

@pytest.mark.asyncio
async def test_query_returns_status_and_multiplayer(monoplayer_game):
    communicator = WebsocketCommunicator(QueryConsumer.as_asgi(), "ws://localhost/query")
    connected, subprotocol = await communicator.connect()
    assert connected
    gameId = monoplayer_game.uuid
    playerId = monoplayer_game.players[0].uuid
    await communicator.send_to(text_data=json.dumps({"gameId": gameId, "player1Id": playerId}))
    response = await communicator.receive_from()
    assert json.loads(response)['phaseOfGame'] == 'playing'
    await communicator.disconnect()

@pytest.mark.asyncio
async def test_monoplayer_game_cannot_be_joined(monoplayer_game):
    communicator = WebsocketCommunicator(QueryConsumer.as_asgi(), "ws://localhost/query")
    connected, subprotocol = await communicator.connect()
    assert connected
    gameId = monoplayer_game.uuid
    playerId = monoplayer_game.players[0].uuid
    await communicator.send_to(text_data=json.dumps({"gameId": gameId, "player1Id": str(uuid4())}))
    response = await communicator.receive_from()
    assert json.loads(response)["phaseOfGame"] == "error"
    await communicator.disconnect()

"""
if game, multi, one player => compare playerId with player in game. if matches, keep 'waiting'. else, send 'joining' message to joining player
"""

@pytest.mark.asyncio
async def test_multiplayer_keep_waiting(multiplayer_game):
    communicator = WebsocketCommunicator(QueryConsumer.as_asgi(), "ws://localhost/query")
    connected, subprotocol = await communicator.connect()
    assert connected
    gameId = multiplayer_game.uuid
    playerId = multiplayer_game.players[0].uuid
    await communicator.send_to(text_data=json.dumps({"gameId": gameId, "player1Id": playerId}))
    response = await communicator.receive_from()
    assert json.loads(response) == {"phaseOfGame": "waiting", "multiPlayer": True}
    await communicator.disconnect()

@pytest.mark.asyncio
async def test_multiplayer_keep_waiting(multiplayer_game):
    communicator = WebsocketCommunicator(QueryConsumer.as_asgi(), "ws://localhost/query")
    connected, subprotocol = await communicator.connect()
    assert connected
    gameId = multiplayer_game.uuid
    await communicator.send_to(text_data=json.dumps({"gameId": gameId, "player1Id": str(uuid4())}))
    response = await communicator.receive_from()
    assert json.loads(response) == {"phaseOfGame": "joining", "multiPlayer": True}
    await communicator.disconnect()

@pytest.mark.asyncio
async def test_multiplayer_game_full(multiplayer_game):
    communicator = WebsocketCommunicator(QueryConsumer.as_asgi(), "ws://localhost/query")
    connected, subprotocol = await communicator.connect()
    assert connected
    gameId = multiplayer_game.uuid
    second_player = Player("Puffy", uuid4())
    multiplayer_game.add_player(second_player)
    await communicator.send_to(text_data=json.dumps({"gameId": gameId, "player1Id": str(uuid4())}))
    response = await communicator.receive_from()
    assert json.loads(response) == {"phaseOfGame": "error", "message": {"category": "result", "content": GameMixin.error_messages["full"], "points": None}}
    await communicator.disconnect()

@pytest.mark.asyncio
async def test_multiplayer_continue(multiplayer_game):
    print("test multiplayer continue")
    communicator = WebsocketCommunicator(QueryConsumer.as_asgi(), "ws://localhost/query")
    connected, subprotocol = await communicator.connect()
    assert connected
    gameId = multiplayer_game.uuid
    second_player = Player("Puffy", uuid4())
    multiplayer_game.add_player(second_player)
    await communicator.send_to(text_data=json.dumps({"gameId": gameId, "player1Id": second_player.uuid}))
    response = await communicator.receive_from()
    assert json.loads(response)['phaseOfGame'] == 'playing'
    await communicator.disconnect()


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

@pytest.mark.asyncio
async def test_user_can_guess_mono(monoplayer_game):
    communicator = WebsocketCommunicator(GameConsumer.as_asgi(), f"ws://localhost/{monoplayer_game.uuid}?{monoplayer_game.players[0].uuid}")
    connected, subprotocol = await communicator.connect()
    assert connected
    await communicator.send_to(text_data=json.dumps(create_game_state(monoplayer_game.uuid, monoplayer_game.players[0].uuid, input=['T','E','A','M'])))
    response = await communicator.receive_from()
    assert json.loads(response)["message"] == {"category": "result", "content": message_reference[1], "points": 1}
    await communicator.disconnect()



# BUG: the following test only passes when running alone
"""
@pytest.mark.asyncio
async def test_game_notifies_consumer_when_ended():
    new_game_id = str(uuid4())
    new_player_id = str(uuid4()) 
    communicator = WebsocketCommunicator(GameConsumer.as_asgi(), f"ws://localhost/{new_game_id}?{new_player_id}")
    connected, subprotocol = await communicator.connect()
    assert connected
    await communicator.send_to(text_data=json.dumps(create_game_state(new_game_id, new_player_id)))
    response = await communicator.receive_from()
    sleep(timeout + 1)
    response_end = await communicator.receive_from()
    assert json.loads(response_end)["phaseOfGame"] == "ended"

    await communicator.disconnect()
"""
# BUG: the following test only passes when running alone
""" => RuntimeError: <Queue at 0x7f25fd3b4e90 maxsize=0 _getters[1]> is bound to a different event loop
@pytest.mark.asyncio
async def test_creates_new_game_if_not_exists_multi():
    num_of_games = len(games)
    new_game_id = str(uuid4())
    new_player_id = str(uuid4())
    new_player_id2 = str(uuid4())
    print(new_player_id, new_player_id2)
    communicator = WebsocketCommunicator(GameConsumer.as_asgi(), f"ws://localhost/{new_game_id}?{new_player_id}")
    communicator2 = WebsocketCommunicator(GameConsumer.as_asgi(), f"ws://localhost/{new_game_id}?{new_player_id2}")
    connected, subprotocol = await communicator.connect()
    assert connected
    connected2, subprotocol2 = await communicator2.connect()
    assert connected2
    await communicator.send_to(text_data=json.dumps(create_game_state(new_game_id, new_player_id, multiPlayer=True)))
    response = await communicator.receive_from()
    assert len(games) == num_of_games + 1
    assert json.loads(response)["phaseOfGame"] == "waiting"
    assert json.loads(response)["letters"] == None
    await communicator2.send_to(text_data=json.dumps(create_game_state(new_game_id, new_player_id2, multiPlayer=True, phaseOfGame="joining", player1Name="Plouffyvampire")))
    response = await communicator2.receive_from()
    # game starts for player 2
    assert json.loads(response)["phaseOfGame"] == "playing"
    assert json.loads(response)["letters"] == ['A', 'E', 'L', 'M', 'S', 'T', 'X']
    # game also starts for 1st player
    response = await communicator.receive_from()
    assert json.loads(response)["phaseOfGame"] == "playing"
    assert json.loads(response)["letters"] == ['A', 'E', 'L', 'M', 'S', 'T', 'X']
    await communicator.disconnect()
    await communicator2.disconnect()
"""

