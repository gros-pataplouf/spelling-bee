import time
from channels.exceptions import DenyConnection


class RateLimiter:

    def __init__(self, window_min, window_max, max_requests):
        self.window_min = window_min
        self.window_max = window_max
        self.max_requests = max_requests
        self.counter = 0
        self.frame = [time.time(), time.time() + self.window_min]

    def throttle(self, func):
        def wrapper(*args, **kwargs):
            [socket] = args
            self.counter += 1
            self.frame[1] = time.time()
            current_rate = self.counter / (self.get_time_delta())
            if self.get_time_delta() > self.window_max:
                self.counter = round(self.window_min / self.get_time_delta())
                self.frame[0] = self.frame[1] - self.window_min
            if current_rate > self.max_requests:
                raise DenyConnection
            return func(*args, **kwargs)
        return wrapper

    def get_time_delta(self):
        return self.frame[1] - self.frame[0]
