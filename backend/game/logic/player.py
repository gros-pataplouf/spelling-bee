from game.logic.helpers import is_valid_uuid

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
        if not is_valid_uuid(str(input)):
            raise ValueError
        else:
            return input
