
import pytest, os, django
from game.consumers import GameConsumer, QueryConsumer
from game.game import Player, Game
from uuid import uuid4
from channels.testing import WebsocketCommunicator

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.dev')

django.setup()

@pytest.fixture
def player():
    return Player("Plouf", uuid4())

@pytest.fixture
def games():
    return [Game(timeout=2)]



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


