class TokenBucket:
    def __init__(self, capacity: float, rate: float):
        if capacity <= 0 or rate <= 0:
            raise ValueError('positive capacity and rate required')
        self.capacity = capacity
        self.rate = rate
        self.tokens = capacity
        self.last = 0.0
    def allow(self, now: float) -> bool:
        if now < self.last:
            raise ValueError('time must move forward')
        self.tokens = min(self.capacity, self.tokens + (now - self.last) * self.rate)
        self.last = now
        if self.tokens < 1:
            return False
        self.tokens -= 1
        return True

if __name__ == '__main__':
    b = TokenBucket(2, 1)
    assert b.allow(0) and b.allow(0) and not b.allow(0) and b.allow(1)
    print('rate limiter passed')
