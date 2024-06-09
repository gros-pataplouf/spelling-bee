import pytest
from uuid import uuid4
from game.player import Player
from game.helpers import is_valid_uuid


def test_player_has_name():
    player = Player("Plouf", uuid4())
    assert player.name == "Plouf"

def test_player_has_valid_uuid():
    player = Player("Plouf", uuid4())
    assert is_valid_uuid(str(player.uuid))

def test_player_cannot_have_invalid_uuid():
    with pytest.raises(ValueError):
        Player("Blabla", "invalid-uuid")

def test_player_starts_with_0_points():
    player = Player("Plouf", uuid4())
    assert player.points == 0

def test_player_starts_empty_wordlist():
    player = Player("Plouf", uuid4())
    assert player.guessed_words == []

