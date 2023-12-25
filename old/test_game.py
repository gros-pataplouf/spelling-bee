import pytest, json
from game import Game


@pytest.fixture
def game():
    return Game()

@pytest.fixture
def game_with_players():
    return  Game("player1", "player2")


@pytest.fixture
def solutions():
    solutions = []
    with open("solutions.json", "r", encoding="utf-8") as solutions_file:
        solutions = json.load(solutions_file)
    return solutions



def test_letterset_has_length_7(game):
    assert len(game.letterset) == 7

def test_game_with_min_20_solutions(game):
    assert len(game.solutions) > 19

def test_game_has_middleletter(game):
    assert game.middleletter
def test_candidates(game):
    assert len(game.candidates) > 0

def test_middleletter_in_20_solutions(game, solutions):
    counter = 0
    for word in solutions:
        if game.middleletter in word:
            if set(word).issubset(set(game.letterset)):
                counter += 1
    assert counter > 19

def test_get_game(game):
    assert game.get_game()[0] == game.middleletter

#game can be initialized with one or two players 
def test_set_players(game_with_players):
    assert game_with_players.players == {"player1": 0, "player2": 0}

#game starts with empty list of guesses
def test_empty_guesses(game_with_players):
    assert game_with_players.guesses == []

def test_play_accept_solution(game_with_players):
    game_with_players.letterset = "speling"
    with open("solutions.json", "r", encoding="utf-8") as f:
        all_solutions =  json.load(f)
        game_with_players.solutions = list(filter(lambda solution: set(solution).issubset(set(game_with_players.letterset)), all_solutions))
    game_with_players.play("player1", "lens")
    assert "lens" in game_with_players.guesses

def test_play_too_short(game_with_players):
    game_with_players.letterset = "speling"
    with open("solutions.json", "r", encoding="utf-8") as f:
        all_solutions =  json.load(f)
        game_with_players.solutions = list(filter(lambda solution: set(solution).issubset(set(game_with_players.letterset)) and game_with_players.letterset[0] == "s", all_solutions))
    game_with_players.play("player1", "sip")
    assert "sip" not in game_with_players.guesses

def test_wrong_letters(game_with_players):
    game_with_players.letterset = "speling"
    with open("solutions.json", "r", encoding="utf-8") as f:
        all_solutions =  json.load(f)
        game_with_players.solutions = list(filter(lambda solution: set(solution).issubset(set(game_with_players.letterset)) and game_with_players.letterset[0] == "s", all_solutions))
    game_with_players.play("player1", "pains")
    assert "pains" not in game_with_players.guesses

def test_forgot_middleletter(game_with_players):
    game_with_players.letterset = "speling"
    with open("solutions.json", "r", encoding="utf-8") as f:
        all_solutions =  json.load(f)
        game_with_players.solutions = list(filter(lambda solution: set(solution).issubset(set(game_with_players.letterset)) and game_with_players.letterset[0] == "s", all_solutions))
    game_with_players.play("player1", "pains")
    assert "teen" not in game_with_players.guesses

def test_incorrect_word(game_with_players):
    game_with_players.letterset = "speling"
    with open("solutions.json", "r", encoding="utf-8") as f:
        all_solutions =  json.load(f)
        game_with_players.solutions = list(filter(lambda solution: set(solution).issubset(set(game_with_players.letterset)) and game_with_players.letterset[0] == "s", all_solutions))
    game_with_players.play("player1", "spln")
    assert "spln" not in game_with_players.guesses

def test_4_letters_1_point(game_with_players):
    game_with_players.letterset = "speling"
    with open("solutions.json", "r", encoding="utf-8") as f:
        all_solutions =  json.load(f)
        game_with_players.solutions = list(filter(lambda solution: set(solution).issubset(set(game_with_players.letterset)) and game_with_players.letterset[0] == "s", all_solutions))
    points_before = game_with_players.players["player1"]
    game_with_players.play("player1", "lens")
    assert game_with_players.players["player1"] - points_before == 1

 
def test_5_or_more_letters(game_with_players):
    game_with_players.letterset = "speling"
    points_before = game_with_players.players["player1"]
    with open("solutions.json", "r", encoding="utf-8") as f:
        all_solutions =  json.load(f)
        game_with_players.solutions = list(filter(lambda solution: set(solution).issubset(set(game_with_players.letterset)) and game_with_players.letterset[0] == "s", all_solutions))
    game_with_players.play("player1", "selling") #7 letters, should give 3 points
    assert game_with_players.players["player1"] - points_before == 4

def test_pangram(game_with_players):
    game_with_players.letterset = "speling"
    points_before = game_with_players.players["player1"]
    with open("solutions.json", "r", encoding="utf-8") as f:
        all_solutions =  json.load(f)
        game_with_players.solutions = list(filter(lambda solution: set(solution).issubset(set(game_with_players.letterset)), all_solutions))
    game_with_players.play("player1", "spelling")
    assert game_with_players.players["player1"] - points_before == len('spelling') + 4
"aceiloz"

def test_aceiloz(game_with_players):
    game_with_players.letterset = "aceiloz"
    points_before = game_with_players.players["player1"]
    with open("solutions.json", "r", encoding="utf-8") as f:
        all_solutions =  json.load(f)
        game_with_players.solutions = list(filter(lambda solution: set(solution).issubset(set(game_with_players.letterset)) and game_with_players.letterset[0] == "a", all_solutions))
    game_with_players.play("player1", "lice") # 1
    assert game_with_players.players["player1"] - points_before == 1
