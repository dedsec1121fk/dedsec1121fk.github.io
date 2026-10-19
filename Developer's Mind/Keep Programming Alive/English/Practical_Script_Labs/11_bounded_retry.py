def retry(action, max_attempts: int = 3):
    if max_attempts < 1:
        raise ValueError('max_attempts must be positive')
    for attempt in range(1, max_attempts + 1):
        try:
            return action()
        except TimeoutError:
            if attempt == max_attempts:
                raise

if __name__ == '__main__':
    count = [0]
    def flaky():
        count[0] += 1
        if count[0] < 3:
            raise TimeoutError('simulated')
        return 'ok'
    assert retry(flaky) == 'ok' and count[0] == 3
    print('retry succeeded after 3 attempts')
