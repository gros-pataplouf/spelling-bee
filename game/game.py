import re
from uuid import uuid4

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
    
    @property
    def uuid(self):
        return self.__uuid
    
    def validate_uuid(self, input):
        uuid_regex = re.compile("[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}")
        if not uuid_regex.match(str(input)):
            raise ValueError
        else:
            return input

