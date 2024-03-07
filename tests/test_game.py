import pytest, re
from uuid import uuid4
from game.game import Game, Player


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


#initializing the game

#a game has a game id, which is a valid uuid
# a game cannot have an invalid uuid
# an initialized game has a random letterset
# a game starts with zero points for each player
# 
# a game has up to two players; a 3rd player joining will be rejected
# the player name must be unique

