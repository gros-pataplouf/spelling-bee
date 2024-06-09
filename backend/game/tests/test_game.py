import pytest, random, json
from uuid import uuid4
from game.game import Game
from game.player import Player
from time import sleep
from game.helpers import is_valid_uuid
from core.settings.dev import BASE_DIR

@pytest.fixture
def player1():
    yield Player("Plouf", uuid4())

@pytest.fixture
def player2():
    yield Player("Mopsie", uuid4())


def test_game_has_valid_uuid():
    game = Game()
    assert is_valid_uuid(str(game.uuid))

def test_invalid_game_uuid_raises_ValueError():
    with pytest.raises(ValueError):
        Game("invalid-uuid")

def test_game_has_random_letterset():
    game = Game()
    random.seed(3)
    letterset = []
    with open(f"{BASE_DIR.parent.joinpath('game/lettersets.json')}", "r", encoding="utf-8") as f:
        lettersets =  json.load(f)
        letterset = [letter.upper() for letter in list(lettersets[random.randint(0,len(lettersets)-1)])]
    assert game.letterset == letterset

def test_player_can_join_game(player1):
    game = Game()
    game.add_player(player1)
    assert game.players == [player1]

def test_if_not_multiplayer_only_one_can_join(player1, player2):
    game = Game()
    game.add_player(player1)
    with pytest.raises(ValueError):
        game.add_player(player2, multiplayer=True)
    assert game.multiplayer == False


def test_max_2_players_in_game(player1):
    game = Game()
    game.add_player(player1, multiplayer=True)
    game.add_player(Player("Second", uuid4()))
    with pytest.raises(Exception):
        game.add_player(Player("Third", uuid4()))

def test_player_name_unique(player1, player2):
    game = Game()
    game.add_player(player1, multiplayer=True)
    player2.name = player1.name
    with pytest.raises(ValueError):
        game.add_player(player2)
    assert len(game.players) == 1

def test_player_must_join_before_guessing(player1):
    game = Game()
    with pytest.raises(Exception):
        game.guess(player1, "test")

def test_player_receives_0pts_for_wrong_solution(player1):
    game = Game()
    game.add_player(player1)
    result = game.guess(player1.uuid, "aelms")
    assert result["points"] == 0

def test_game_has_solutions():
    game = Game()
    for solution in game.solutions:
        assert set(solution).issubset(set(game.letterset))
        assert game.letterset[0] in solution

def test_guess_too_short(player1):
    game = Game()
    game.add_player(player1)
    result = game.guess(player1.uuid, "tax")
    assert result["points"] == 0
    assert result["message"] == "too short"

def test_middleletter_missing(player1):
    game = Game()
    game.add_player(player1)
    result = game.guess(player1.uuid, "text")
    assert result["points"] == 0
    assert result["message"] == "middleletter missing"

def test_correct_guess_returns_added_points(player1):
    game = Game()
    game.add_player(player1)
    result = game.guess(player1.uuid, "teammate")
    assert result["points"] == 5
    assert result["message"] == "awesome"

def test_player_gets_points_acc_to_wordlength(player1):
    game = Game()
    game.add_player(player1)
    points_before = player1.points
    game.guess(player1.uuid, "team")
    assert player1.points == points_before + 1

def test_pangram_earns_extra_7_points(player1):
    game = Game()
    game.add_player(player1)
    points_before = player1.points
    my_guess = "malaxates"
    result = game.guess(player1.uuid, my_guess)
    assert result["points"] == 13
    assert result["message"] == "Pangram!"
    assert player1.points == points_before + len(my_guess) - 3 + 7

def test_guessed_words_updated_for_player(player1):
    game = Game()
    game.add_player(player1)
    game.guess(player1.uuid, "team")
    assert player1.guessed_words == ["TEAM"]
    assert player1.points == 1

def test_word_can_only_be_guessed_once(player1, player2):
    game = Game()
    game.add_player(player1, multiplayer=True)
    game.add_player(player2)
    game.guess(player1.uuid, "mate")
    result = game.guess(player2.uuid, "mate")
    assert result["points"] == 0
    assert result["message"] == "already guessed"
    assert player2.guessed_words == []
        
def test_game_is_not_multiplayer_by_default(player1):
    game = Game()
    game.add_player(player1)
    assert game.multiplayer == False

def test_first_player_can_set_multiplayer(player1):
   game = Game()
   game.add_player(player1, multiplayer = True)
   assert game.multiplayer == True 

def test_multiplayer_one_player_cannot_get_letterset(player1):
    game = Game()
    game.add_player(player1, multiplayer = True)
    assert game.letterset == None

def test_game_status_waiting_if_one_player_multiplayer(player1):
    game = Game()
    game.add_player(player1, multiplayer = True)
    assert game.status == "waiting"

def test_when_second_player_joins_status_becomes_playing(player1, player2):
    game = Game()
    game.add_player(player1, multiplayer = True)
    game.add_player(player2)
    assert game.status == "playing"

def test_game_ends_after_timeout(player1):
    game = Game(timeout = 5)
    game.add_player(player1)
    sleep(6)
    assert game.status == "ended"

def test_game_end_if_all_solutions_guessed(player1):
    game = Game()
    game.add_player(player1)
    for solution in game.solutions:
        game.guess(player1.uuid, solution)
    sleep(2) #to allow the countdown function to call the check function
    assert game.status == "ended"

def test_timeout_decreases_every_second(player1):
    game = Game()
    game.add_player(player1)
    sleep(5)
    assert game.timeout == 1