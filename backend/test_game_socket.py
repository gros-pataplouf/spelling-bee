
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
async def test_enforces_valid_playerId_negative():
    communicator = WebsocketCommunicator(GameConsumer.as_asgi(), f"ws://localhost/{uuid4()}?fake")
    connected, subprotocol = await communicator.connect()
    assert not connected

@pytest.mark.asyncio
async def test_enforces_valid_playerId_positive():
    communicator = WebsocketCommunicator(GameConsumer.as_asgi(), f"ws://localhost/{uuid4()}?{uuid4()}")
    connected, subprotocol = await communicator.connect()
    assert connected



# @pytest.mark.asyncio
# async def test_query_ws_returns_error_if_not_exists():
#     communicator = WebsocketCommunicator(QueryConsumer.as_asgi(), "ws://localhost/query")
#     connected, subprotocol = await communicator.connect()
#     assert connected
#     await communicator.send_to(text_data=json.dumps({"gameId": "fake"}))
#     response = await communicator.receive_from()
#     assert json.loads(response) == {"phaseOfGame": "error", "message": {"category": "result", "content": "game does not exist", "points": None}}
#     await communicator.disconnect()
