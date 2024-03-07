import re, random, json, sys
from uuid import uuid4
from pathlib import Path

class Player:
    def __init__(self, name, uuid) -> None:
        self.__name = name
        self.__uuid = self.validate_uuid(uuid)
        self.__points = 0
        self.__guessed_words = []
    @property
    def name(self):
        return self.__name
    @property
    def uuid(self):
        return self.__uuid
    @property
    def points(self):
        return self.__points
    @property
    def guessed_words(self):
        return self.__guessed_words
    
    def validate_uuid(self, input):
        uuid_regex = re.compile("[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}")
        if not uuid_regex.match(str(input)):
            raise ValueError
        else:
            return input



class Game:
    def __init__(self, uuid=None) -> None:
         self.__uuid = uuid4() if not uuid else self.validate_uuid(uuid)
         self.__letterset = self.get_letterset()
    
    @property
    def uuid(self):
        return self.__uuid
    @property
    def letterset(self):
        return self.__letterset
    
    def get_letterset(self):
        letterset = []

        with open(f"{Path.cwd()}/game/lettersets.json", "r", encoding="utf-8") as f:
            lettersets =  json.load(f)
            print(sys.argv[0])
            if 'pytest' in sys.argv[0]:
                print('running pytest, setting random seed')
                random.seed(3)
            letterset = list(lettersets[random.randint(0,len(lettersets)-1)])
        return letterset
        

    def validate_uuid(self, input):
        uuid_regex = re.compile("[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}")
        if not uuid_regex.match(str(input)):
            raise ValueError
        else:
            return input

