import pytest
from game.game import Game, Player


def test_player_has_name():
    player = Player("Plouf")
    assert player.name == "Plouf"


# initializing the players 
# a player has a name
# a player has a uuid as an id
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

