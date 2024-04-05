
import pytest, os, django, re, json
from game.consumers import GameConsumer, QueryConsumer, games
from game.game import Player, Game
from uuid import uuid4
from channels.testing import WebsocketCommunicator

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.dev')

django.setup()

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
async def test_game_connection_can_be_established():
    communicator = WebsocketCommunicator(GameConsumer.as_asgi(), f"ws://localhost/{uuid4()}")
    connected, subprotocol = await communicator.connect()
    assert connected
    await communicator.disconnect()

@pytest.mark.asyncio
async def test_query_connection_can_be_established():
    communicator = WebsocketCommunicator(QueryConsumer.as_asgi(), "ws://localhost/query")
    connected, subprotocol = await communicator.connect()
    assert connected
    await communicator.disconnect()

@pytest.mark.asyncio
async def test_query_ws_returns_error_if_not_exists():
    communicator = WebsocketCommunicator(QueryConsumer.as_asgi(), "ws://localhost/query")
    connected, subprotocol = await communicator.connect()
    assert connected
    await communicator.send_to(text_data=json.dumps({"gameId": "fake"}))
    response = await communicator.receive_from()
    assert json.loads(response) == {"phaseOfGame": "error", "message": {"category": "result", "content": "game does not exist", "points": None}}
    await communicator.disconnect()

@pytest.mark.asyncio
async def test_query_returns_status(monoplayer_game):
    communicator = WebsocketCommunicator(QueryConsumer.as_asgi(), "ws://localhost/query")
    connected, subprotocol = await communicator.connect()
    assert connected
    gameId = monoplayer_game.uuid
    playerId = monoplayer_game.players[0].uuid
    await communicator.send_to(text_data=json.dumps({"gameId": gameId, "player1Id": playerId}))
    response = await communicator.receive_from()
    assert json.loads(response) == {"phaseOfGame": "playing"}
    await communicator.disconnect()
