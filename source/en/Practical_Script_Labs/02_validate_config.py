import json

def validate(text: str) -> dict:
    data = json.loads(text)
    if not isinstance(data, dict):
        raise ValueError("Expected a JSON object")
    if type(data.get("enabled")) is not bool:
        raise ValueError("enabled must be boolean")
    limit = data.get("max_items")
    if type(limit) is not int or not 1 <= limit <= 1000:
        raise ValueError("max_items must be integer 1..1000")
    return data

if __name__ == "__main__":
    assert validate('{"enabled":true,"max_items":12}')['max_items'] == 12
    try:
        validate('{"enabled":"yes","max_items":12}')
        raise AssertionError("invalid input accepted")
    except ValueError:
        pass
    print("valid and invalid settings tested")
