
import pytest, os, django, json
from time import sleep
from game.consumers import GameConsumer, QueryConsumer, games, throttler
from game.game import Player, Game
from uuid import uuid4
from channels.testing import WebsocketCommunicator
from channels.exceptions import DenyConnection
from .helpers import create_game_state

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.dev')
django.setup()


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
async def test_rejects_invalid_player_id():
    new_player_id = "not_a_valid_uuid"
    communicator = WebsocketCommunicator(GameConsumer.as_asgi(), f"ws://localhost/{uuid4()}?{new_player_id}")
    connected, subprotocol = await communicator.connect()
    assert not connected
    await communicator.disconnect()

@pytest.mark.asyncio
async def test_accepts_valid_player_id():
    new_player_id = str(uuid4())
    communicator = WebsocketCommunicator(GameConsumer.as_asgi(), f"ws://localhost/{uuid4()}?{new_player_id}")
    connected, subprotocol = await communicator.connect()
    assert connected
    await communicator.disconnect()

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
    assert json.loads(response)["message"] == {"category": "result", "content": Game.points_feedback[1], "points": 1}
    await communicator.disconnect()

@pytest.mark.asyncio
async def test_throttle():
    throttler.max_requests = 0.1
    communicator = WebsocketCommunicator(QueryConsumer.as_asgi(), f"ws://localhost/query")
    connected, subprotocol = await communicator.connect()
    await communicator.send_to(text_data=json.dumps({"gameId": str(uuid4())}))
    await communicator.send_to(text_data=json.dumps({"gameId": str(uuid4())}))
    await communicator.send_to(text_data=json.dumps({"gameId": str(uuid4())}))
    response = await communicator.receive_from()
    assert not connected
    throttler.max_requests = 3
    await communicator.disconnect()


@pytest.mark.asyncio
async def test_refuse_large_payload():
    large_payload = {key: value for key, value in enumerate(range(1000))}
    communicator = WebsocketCommunicator(QueryConsumer.as_asgi(), f"ws://localhost/query")
    await communicator.connect()
    with pytest.raises(DenyConnection):
        await communicator.send_to(text_data=json.dumps(large_payload))
        await communicator.receive_from()
        await communicator.disconnect()


@pytest.mark.asyncio
async def test_game_notifies_consumer_when_ended():
    new_game_id = str(uuid4())
    new_player_id = str(uuid4()) 
    communicator = WebsocketCommunicator(GameConsumer.as_asgi(), f"ws://localhost/{new_game_id}?{new_player_id}")
    connected, subprotocol = await communicator.connect()
    assert connected
    await communicator.send_to(text_data=json.dumps(create_game_state(new_game_id, new_player_id)))
    response_queue = []
    for i in range(0, 7):
        sleep(1)
        response = await communicator.receive_from()
    sleep(7)
    assert json.loads(response)["phaseOfGame"] == "ended"
    await communicator.disconnect()


@pytest.mark.asyncio
async def test_creates_new_game_if_not_exists_multi():
    num_of_games = len(games)
    new_game_id = str(uuid4())
    new_player_id = str(uuid4())
    new_player_id2 = str(uuid4())
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
