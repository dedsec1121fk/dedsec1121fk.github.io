import json

def filter_rows(lines, min_level=2):
    accepted, errors = [], []
    for number, line in enumerate(lines, 1):
        try:
            row = json.loads(line)
            if not isinstance(row, dict) or type(row.get('level')) is not int:
                raise ValueError('invalid schema')
            if row['level'] >= min_level:
                accepted.append(row)
        except (json.JSONDecodeError, ValueError):
            errors.append(number)
    return accepted, errors

if __name__ == '__main__':
    good, errors = filter_rows(['{"level":1}', '{"level":3}', 'oops'])
    assert [x['level'] for x in good] == [3] and errors == [3]
    print(good, errors)
