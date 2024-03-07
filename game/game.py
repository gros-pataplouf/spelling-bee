import re
from uuid import uuid4

def validate_uuid(input):
    uuid_regex = re.compile("[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}")
    if not uuid_regex.match(str(input)):
        raise ValueError
    else:
        return input


class Player:
    def __init__(self, name, uuid) -> None:
        self.__name = name
        self.__uuid = validate_uuid(uuid)
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



class Game:
    pass
