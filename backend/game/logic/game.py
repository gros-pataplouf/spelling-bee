import random, json, sys
from asgiref.sync import async_to_sync
from uuid import uuid4
from time import sleep
from channels.layers import get_channel_layer
from game.logic.helpers import threaded, GameAdapter, is_valid_uuid
from core.settings.prod import BASE_DIR, TIMEOUT #also ok for dev, is the same dir

channel_layer = get_channel_layer()


class Game:
    POINTS_FEEDBACK = {
        1: "correct", 
        2: "good",
        3: "not too bad",
        4: "respect",
        5: "awesome",
        6: "amazing",
        7: "rockstar"
    }
    def __init__(self, uuid=None, timeout=TIMEOUT) -> None:
         self.__uuid = uuid4() if not uuid else self.validate_uuid(uuid)
         self.__letterset = self.get_letterset()
         self.__players = []
         self.__solutions = self.get_solutions(self.__letterset)
         self.__guesses_left = len(self.__solutions)
         self.__multiplayer = False
         self.__status = 'playing'
         self.__timeout = timeout
         self.observers = []
    @property
    def timeout(self):
        return self.__timeout
    @property
    def uuid(self):
        return str(self.__uuid)
    @property
    def status(self):
        return str(self.__status)
    @status.setter
    def status(self, new_status):
        self.__status = new_status

    @property
    def letterset(self):
        if self.__multiplayer and len(self.__players) < 2:
            return None
        else:
            return self.__letterset
    @property
    def players(self):
        return self.__players
    @property
    def solutions(self):
        return self.__solutions
    @property
    def multiplayer(self):
        return self.__multiplayer
    @property
    def guesses_left(self):
        return self.__guesses_left
    
    def get_letterset(self):
        letterset = []
        with open(f"{BASE_DIR.parent.joinpath('game/logic/lettersets.json')}", "r", encoding="utf-8") as f:
            lettersets =  json.load(f)
            if 'pytest' in sys.argv[0]:
                random.seed(3)
            letterset = list((lettersets[random.randint(0,len(lettersets)-1)]).upper())
        return letterset

    def get_solutions(self, letterset):
        with open(f"{BASE_DIR.parent.joinpath('game/logic/solutions.json')}", "r", encoding="utf-8") as s:
            all_solutions = [solution.upper() for solution in json.load(s)]
            solutions = list(filter(lambda word: set(word).issubset(set(letterset)), all_solutions))
            solutions_with_middleletter = list(filter(lambda word: letterset[0] in word, solutions))
            return solutions_with_middleletter
        
    @classmethod
    def validate_uuid(self, input):
        if not is_valid_uuid(str(input)):
            raise ValueError
        else:
            return input

    def discard(self):
        self.observers = []
        del self


    def add_player(self, player, multiplayer=False):
        if len(self.players) > 0:
            multiplayer = self.multiplayer
        max_players = 2 if multiplayer else 1
        if len(self.players) == max_players:
            raise ValueError(f"Only {max_players} player(s) can join game.")
        if list(filter(lambda x: x.name == player.name, self.__players)):
            raise ValueError("Player name must be unique.")
        self.__players.append(player)
        if multiplayer and len(self.__players) == 1:
            self.__multiplayer = multiplayer
            self.__status = 'waiting'
        elif self.__multiplayer and len(self.__players) == 2:
            self.__status = 'playing'
            self.countdown()
        else:
            self.countdown()
        return player
    
    def guess(self, player_uuid, guess) -> int:
        added_points = 0
        message = None
        guess = guess.upper()
        player_in_game = list(filter(lambda p: p.uuid == player_uuid, self.__players))
        if not player_in_game:
            raise Exception("Player must join game before guessing.")

        if len(guess) < 4:
            message = "too short"
            return {"points": added_points, "message": message}

        if self.letterset[0] not in guess:
            message = "middleletter missing"
            return {"points": added_points, "message": message}

        if list(filter(lambda p: guess in p.guessed_words, self.__players)):
            message = "already guessed"
            return {"points": added_points, "message": message}

        is_correct_guess = guess in self.__solutions

        if is_correct_guess:
            added_points += len(guess) - 3
            player_in_game[0].points = added_points
            player_in_game[0].guessed_words = guess
            self.__guesses_left -= 1
            message = self.POINTS_FEEDBACK.get(added_points) or self.POINTS_FEEDBACK.get(max(self.POINTS_FEEDBACK.keys()))
        if self.__is_pangram(guess):
            added_points += 7
            player_in_game[0].points =  7
            message = "Pangram!"
        if not is_correct_guess:
            message = "not a word"
        return {"points": added_points, "message": message}
    
    def __is_pangram(self, guess):
        if guess in self.__solutions:
            return set(guess).issubset(set(self.__letterset)) and set(self.__letterset).issubset(set(guess))
        return False
    
    @threaded
    def countdown(self):
        for i in range(0, self.__timeout):
            if not self.observers and "pytest" not in sys.argv[0]:
                self.__status = "ended"
                break
            for obs in self.observers:
                async_to_sync(channel_layer.group_send)(obs.user_group_name, {"type": "update_game", "game": GameAdapter(self), "id": obs.user_group_name[10:]})
            sleep(1)
            self.__timeout -= 1
            if self.guesses_left == 0:
                self.__status = "ended"
                for obs in self.observers:
                    async_to_sync(channel_layer.group_send)(obs.user_group_name, {"type": "update_game", "game": GameAdapter(self), "id": obs.user_group_name[10:]})
        self.__status = "ended"
        for obs in self.observers:
            async_to_sync(channel_layer.group_send)(obs.user_group_name, {"type": "update_game", "game": GameAdapter(self), "id": obs.user_group_name[10:]})
        self.observers = []
