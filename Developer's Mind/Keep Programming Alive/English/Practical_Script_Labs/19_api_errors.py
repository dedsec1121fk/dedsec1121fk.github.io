import json

def error_response(code: str, message: str, field: str | None = None) -> str:
    if not code or not message:
        raise ValueError('code and message required')
    return json.dumps({'error':{'code':code,'message':message,'field':field}},ensure_ascii=False)

if __name__ == '__main__':
    d = json.loads(error_response('invalid_input','Bad value','age'))
    assert d['error']['field'] == 'age'
    print(d)
