
import pytest, os, django
from game.consumers import GameConsumer, QueryConsumer
from uuid import uuid4
from channels.testing import WebsocketCommunicator

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.dev')

django.setup()


@pytest.mark.asyncio
async def test_game_connection_can_be_established():
    communicator = WebsocketCommunicator(GameConsumer.as_asgi(), f"ws://localhost/{uuid4()}")
    connected, subprotocol = await communicator.connect()
    assert connected
    await communicator.disconnect()


