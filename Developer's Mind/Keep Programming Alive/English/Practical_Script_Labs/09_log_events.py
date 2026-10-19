import json

def events(lines):
    for lineno, line in enumerate(lines, 1):
        try:
            event = json.loads(line)
            if not isinstance(event, dict) or event.get('level') not in {'INFO','WARN','ERROR'}:
                raise ValueError('bad event')
            yield lineno, event
        except (ValueError, TypeError):
            yield lineno, {'level':'ERROR','message':'invalid log line'}

if __name__ == '__main__':
    rows = list(events(['{"level":"INFO","message":"start"}', 'oops']))
    assert rows[1][1]['level'] == 'ERROR'
    print(rows)
