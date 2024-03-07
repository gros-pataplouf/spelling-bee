from uuid import uuid4

class Player:
    def __init__(self, name, uuid) -> None:
        self.__name = name
        self.__uuid = uuid
        self.__points = 0
    @property
    def name(self):
        return self.__name
    @property
    def uuid(self):
        return self.__uuid
    @property
    def points(self):
        return self.__points

class Game:
    pass

