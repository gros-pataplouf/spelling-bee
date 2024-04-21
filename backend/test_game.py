import pytest, re, random, json, asyncio
from pathlib import Path
from uuid import uuid4
from game.game import Game, Player, GameException
from time import sleep

def is_valid_uuid(input):
    uuid_regex = re.compile("[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}")
    return uuid_regex.match(input)

@pytest.fixture
def player():
    yield Player("Plouf", uuid4())

@pytest.fixture
def game():
    yield Game()

def test_player_has_name(player):
    assert player.name == "Plouf"

def test_player_has_valid_uuid(player):
    assert is_valid_uuid(str(player.uuid))

def test_player_cannot_have_invalid_uuid():
    with pytest.raises(ValueError):
        Player("Blabla", "invalid-uuid")

def test_player_starts_with_0_points(player):
    assert player.points == 0

def test_player_starts_empty_wordlist(player):
    assert player.guessed_words == []

def test_game_has_valid_uuid(game):
    assert is_valid_uuid(str(game.uuid))

def test_invalid_game_uuid_raises_ValueError():
    with pytest.raises(ValueError):
        Game("invalid-uuid")

def test_game_has_random_letterset(game):
    random.seed(3)
    letterset = []
    with open(f"{Path.cwd()}/game/lettersets.json", "r", encoding="utf-8") as f:
        lettersets =  json.load(f)
        letterset = [letter.upper() for letter in list(lettersets[random.randint(0,len(lettersets)-1)])]
    assert game.letterset == letterset

def test_player_can_join_game(game, player):
    game.add_player(player)
    assert game.players == [player]

def test_if_not_multiplayer_only_one_can_join(game, player):
    game.add_player(player)
    second_player = Player("Cleo", uuid4())
    with pytest.raises(GameException):
        game.add_player(second_player, multiplayer=True)
    assert game.multiplayer == False


def test_max_2_players_in_game(game, player):
    game.add_player(player, multiplayer=True)
    game.add_player(Player("Second", uuid4()))
    with pytest.raises(Exception):
        game.add_player(Player("Third", uuid4()))

def test_player_name_unique(game, player):
    game.add_player(player, multiplayer=True)
    next_player = Player(player.name, uuid4())
    with pytest.raises(GameException):
        game.add_player(next_player)
    assert len(game.players) == 1

def test_player_must_join_before_guessing(game):
    #print(game.letterset) #['a', 'e', 'l', 'm', 's', 't', 'x'] with random.seed(3)
    new_player = Player("Brian", uuid4())
    with pytest.raises(Exception):
        game.guess(new_player, "test")

def test_player_receives_0pts_for_wrong_solution(game, player):
    game.add_player(player)
    result = game.guess(player.uuid, "aelms")
    assert result["points"] == 0

def test_game_has_solutions(game):
    for solution in game.solutions:
        assert set(solution).issubset(set(game.letterset))
        assert game.letterset[0] in solution

def test_guess_too_short(game, player):
    game.add_player(player)
    result = game.guess(player.uuid, "tax")
    assert result["points"] == 0
    assert result["message"] == "too short"

def test_middleletter_missing(game, player):
    game.add_player(player)
    result = game.guess(player.uuid, "text")
    assert result["points"] == 0
    assert result["message"] == "middleletter missing"

def test_correct_guess_returns_added_points(game, player):
    game.add_player(player)
    result = game.guess(player.uuid, "teammate")
    assert result["points"] == 5
    assert result["message"] == "awesome"

def test_player_gets_points_acc_to_wordlength(game, player):  #4 - 1, 5 - 2 etc.
    game.add_player(player)
    points_before = player.points
    game.guess(player.uuid, "team")
    assert player.points == points_before + 1

def test_pangram_earns_extra_7_points(game, player):
    game.add_player(player)
    points_before = player.points
    my_guess = "malaxates"
    result = game.guess(player.uuid, my_guess)
    assert result["points"] == 13
    assert result["message"] == "Pangram!"
    assert player.points == points_before + len(my_guess) - 3 + 7

def test_guessed_words_updated_for_player(game, player):  #4 - 1, 5 - 2 etc.
    game.add_player(player)
    game.guess(player.uuid, "team")
    print(player.guessed_words)
    assert player.guessed_words == ["TEAM"]
    assert player.points == 1

def test_word_can_only_be_guessed_once(game, player):
    game.add_player(player, multiplayer=True)
    player2 = Player("Plouf2", uuid4())
    game.add_player(player2)
    game.guess(player.uuid, "mate")
    result = game.guess(player2.uuid, "mate")
    assert result["points"] == 0
    assert result["message"] == "already guessed"
    assert player2.guessed_words == []
        
def test_player_name_can_be_set(player):
    player.name = "Mary"
    assert player.name == "Mary"    

def test_game_is_not_multiplayer_by_default(game, player):
    game.add_player(player)
    assert game.multiplayer == False

def test_first_player_can_set_multiplayer(game, player):
   game.add_player(player, multiplayer = True)
   assert game.multiplayer == True 

def test_multiplayer_one_player_cannot_get_letterset(game, player):
    game.add_player(player, multiplayer = True)
    assert game.letterset == None

def test_game_status_waiting_if_one_player_multiplayer(game, player):
    game.add_player(player, multiplayer = True)
    assert game.status == "waiting"

def test_when_second_player_joins_status_becomes_playing(game, player):
    game.add_player(player, multiplayer = True)
    second_player = Player("Test", uuid4())
    game.add_player(second_player)
    assert game.status == "playing"

def test_game_ends_after_timeout(player):
    new_game = Game(timeout = 5)
    new_game.add_player(player)
    sleep(6)
    assert new_game.status == "ended"

def test_game_end_if_all_solutions_guessed(game, player):
    game.add_player(player)
    for solution in game.solutions:
        game.guess(player.uuid, solution)
    sleep(2) #to allow the countdown function to call the check function
    assert game.status == "ended"

def test_timeout_decreases_every_second(player):
    new_game = Game()
    new_game.add_player(player)
    sleep(5)
    assert new_game.timeout == 1