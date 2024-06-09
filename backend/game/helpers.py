import threading

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
