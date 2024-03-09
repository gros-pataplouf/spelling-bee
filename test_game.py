import pytest, re, random, json
from pathlib import Path
from uuid import uuid4
from game.game import Game, Player, UniqueException

def is_valid_uuid(input):
    uuid_regex = re.compile("[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}")
    return uuid_regex.match(input)


@pytest.fixture
def player():
    return Player("Plouf", uuid4())

@pytest.fixture
def game():
    return Game()

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

def test_max_2_players_in_game(game, player):
    game.add_player(player)
    game.add_player(Player("Second", uuid4()))
    with pytest.raises(Exception):
        game.add_player(Player("Third", uuid4()))

def test_player_name_unique(game, player):
    game.add_player(player)
    next_player = Player(player.name, uuid4())
    with pytest.raises(UniqueException):
        game.add_player(next_player)
    assert len(game.players) == 1

def test_player_must_join_before_guessing(game):
    #print(game.letterset) #['a', 'e', 'l', 'm', 's', 't', 'x'] with random.seed(3)
    new_player = Player("Brian", uuid4())
    with pytest.raises(Exception):
        game.guess(new_player, "test")

def test_player_receives_false_result_for_wrong_solution(game, player):
    game.add_player(player)
    result = game.guess(player.uuid, "aelms")
    assert result == False

def test_game_has_solutions(game):
    for solution in game.solutions:
        assert set(solution).issubset(set(game.letterset))
        assert game.letterset[0] in solution

def test_correct_guess_returns_true(game, player):
    game.add_player(player)
    result = game.guess(player.uuid, "teammate")
    assert result

def test_player_gets_points_acc_to_wordlength(game, player):  #4 - 1, 5 - 2 etc.
    game.add_player(player)
    points_before = player.points
    game.guess(player.uuid, "team")
    assert player.points == points_before + 1

def test_pangram_earns_extra_7_points(game, player):
    game.add_player(player)
    points_before = player.points
    my_guess = "malaxates"
    game.guess(player.uuid, my_guess)
    assert player.points == points_before + len(my_guess) - 3 + 7



# 
# a game has up to two players; a 3rd player joining will be rejected
# the player name must be unique

