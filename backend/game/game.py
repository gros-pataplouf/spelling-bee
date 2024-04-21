import re, random, json, sys, threading, asyncio
from asgiref.sync import async_to_sync
from uuid import uuid4
from pathlib import Path
from time import sleep

from channels.layers import get_channel_layer
channel_layer = get_channel_layer()

message_reference = {
    1: "correct", 
    2: "good",
    3: "not too bad",
    4: "respect",
    5: "awesome",
    6: "amazing",
    7: "rockstar"
}

timeout = 300 if "pytest" not in sys.argv[0] else 5



def threaded(fn):
    def wrapper(*args, **kwargs):
        thread = threading.Thread(target=fn, args=args, kwargs=kwargs)
        thread.start()
        return thread
    return wrapper

class GameAdapter:
    """a copy of the game with only serializable attributes, without any reference to a websocket consumer.
    Needed for transforming the game into a JSON string to be sent via wss://"""
    def __init__(self, game):
         self.uuid = game.uuid
         self.letterset = game.letterset
         self.players = game.players
         self.solutions = game.solutions
         self.guesses_left = game.guesses_left
         self.multiplayer = game.multiplayer
         self.status = game.status
         self.timeout = game.timeout


class GameException(Exception):
    def __init__(self, message: str) -> None:
        super().__init__()
        self.message = message

class Player:
    def __init__(self, name, uuid) -> None:
        self.__name = name
        self.__uuid = self.validate_uuid(uuid)
        self.__points = 0
        self.__guessed_words = []
        self.group = None
    @property
    def name(self):
        return self.__name
    @property
    def uuid(self):
        return str(self.__uuid)
    @property
    def points(self):
        return self.__points
    @property
    def guessed_words(self):
        return self.__guessed_words
    
    @points.setter
    def points(self, new_points: int):
        self.__points += new_points
    @guessed_words.setter
    def guessed_words(self, new_word: str):
        self.__guessed_words.append(new_word)
    @name.setter
    def name(self, new_name):
        self.__name = new_name
    @classmethod
    def validate_uuid(self, input):
        uuid_regex = re.compile("[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}")
        if not uuid_regex.match(str(input)):
            raise ValueError
        else:
            return input

class Game:
    def __init__(self, uuid=None, timeout=timeout) -> None:
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
        with open(f"{Path.cwd()}/game/lettersets.json", "r", encoding="utf-8") as f:
            lettersets =  json.load(f)
            if 'pytest' in sys.argv[0]:
                random.seed(3)
            letterset = list((lettersets[random.randint(0,len(lettersets)-1)]).upper())
        return letterset

    def get_solutions(self, letterset):
        with open(f"{Path.cwd()}//game/solutions.json", "r", encoding="utf-8") as s:
            all_solutions = [solution.upper() for solution in json.load(s)]
            solutions = list(filter(lambda word: set(word).issubset(set(letterset)), all_solutions))
            solutions_with_middleletter = list(filter(lambda word: letterset[0] in word, solutions))
            return solutions_with_middleletter
        
    def validate_uuid(self, input):
        uuid_regex = re.compile("[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}")
        if not uuid_regex.match(str(input)):
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
            raise GameException(f"Only {max_players} player(s) can join game.")
        if list(filter(lambda x: x.name == player.name, self.__players)):
            raise GameException("Player name must be unique.")
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
            message = message_reference.get(added_points) or message_reference.get(max(message_reference.keys()))
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
    
