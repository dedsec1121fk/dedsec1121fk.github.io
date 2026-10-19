import re

def parse_status(line: str):
    match = re.fullmatch(r'HTTP/(1\.[01]) ([1-5][0-9]{2}) ([^\r\n]{1,90})',line)
    if not match:
        raise ValueError('invalid or unsupported status line')
    version, code, phrase = match.groups()
    return {'version':version,'code':int(code),'reason':phrase}

if __name__ == '__main__':
    assert parse_status('HTTP/1.1 404 Not Found')['code'] == 404
    try:
        parse_status('HTTP/1.1 200 OK\r\nInjected: yes')
        raise AssertionError('newline should be rejected')
    except ValueError:
        pass
    print(parse_status('HTTP/1.1 200 OK'))
