from uuid import uuid4

class Player:
    def __init__(self, name, uuid) -> None:
        self.__name = name
        self.__uuid = uuid
    @property
    def name(self):
        return self.__name
    @property
    def uuid(self):
        return self.__uuid

class Game:
    pass

