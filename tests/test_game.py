import pytest, re
from uuid import uuid4
from game.game import Game, Player


def is_valid_uuid(input):
    uuid_regex = re.compile("[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}")
    return uuid_regex.match(input)


@pytest.fixture
def player():
    return Player("Plouf", uuid4())

def test_player_has_name(player):
    assert player.name == "Plouf"

def test_player_has_valid_uuid(player):
    assert is_valid_uuid(str(player.uuid))

def test_player_starts_with_0_points(player):
    assert player.points == 0




# initializing the players OK
# a player has a name OK
# a player has a uuid as an id OK
# a points, which start with 0 
# a list of guessed words, which starts empty
# a current level ?


#initializing the game

#a game has a game id, which is a valid uuid
# a game cannot have an invalid uuid
# an initialized game has a random letterset
# a game starts with zero points for each player
# 
# a game has up to two players; a 3rd player joining will be rejected
# the player name must be unique

