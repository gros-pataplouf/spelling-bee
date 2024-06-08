
import pytest, os, django, json
from game.consumers import QueryConsumer, games
from game.game import Player, Game
from uuid import uuid4
from channels.testing import WebsocketCommunicator
from game.mixins import GameMixin

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.dev')
django.setup()


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


