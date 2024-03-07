import random
import json

class Game:
    def __init__(self, player1=None, player2=None, lettersets=[], solutions=[]):
        with open("lettersets.json", "r", encoding="utf-8") as f:
            lettersets =  json.load(f)
        self.letterset = lettersets[random.randint(0,len(lettersets)-1)]
        with open("solutions.json", "r", encoding="utf-8") as f:
            all_solutions =  json.load(f)
            solutions = list(filter(lambda solution: set(solution).issubset(set(self.letterset)), all_solutions))
        self.solutions = solutions
        if player1:
            self.players = {}
            self.players[player1] = 0
        if player2:
            self.players[player2] = 0
        letter_dict = {}
        for letter in self.letterset:
            for solution in self.solutions:
                if letter in solution:
                    if letter_dict.get(letter):
                        letter_dict[letter] += 1
                    else:
                        letter_dict[letter] = 1
        self.letter_dict = letter_dict
        self.candidates = [letter for letter in list(letter_dict) if letter_dict[letter] > sorted(list(letter_dict.values()), reverse=True)[2]]
        self.middleletter = self.candidates[random.randint(0, len(self.candidates) - 1)]
        self.guesses = []
    def get_game(self):
        other_letters = [letter for letter in self.letterset if letter != self.middleletter]
        return [self.middleletter] + other_letters
    def play(self, player, guess):
        if len(guess) > 3 and guess not in self.guesses and guess in self.solutions:
            if self.letterset[0] in guess:
                if set(guess).issubset(self.letterset) and set(self.letterset).issubset(guess):
                    print("Pangram!!!")
                    self.guesses.append(guess)
                    self.players[player] += ((len(guess) - 3) + 7)
                elif set(guess).issubset(self.letterset):
                    self.guesses.append(guess)
                    self.players[player] += len(guess) - 3
        elif len(guess) < 4:
            print("Too short")
        elif guess in self.guesses:
            print("Tell me something new...")
        elif self.letterset[0] not in guess:
            print(self.letterset[0])
            print("Please always use letter", self.letterset[0])
        elif not set(guess).issubset(self.letterset):
            print("Letter not allowed")
        else:
            print("Sorry, not a word")

def main():
    player = "player1"
    game = Game(player)
    print(game.letterset)
    while True:
        before = game.players[player]
        game.play(player, input())
        print("+", game.players[player] - before, f"Total {game.players[player]} points")
        print(game.letterset)

if __name__ == "__main__":
    main()