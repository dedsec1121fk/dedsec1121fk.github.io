# Python AttributeError — distinguish missing fields from absent objects

## Reproduce two different causes
An AttributeError can indicate that the object is the wrong type, that a property was misspelled, or that the value is None. They are different contracts.

~~~python
item = {"name": "Ada"}
# item.name                 # dict has no attribute 'name'
# None.strip()              # 'NoneType' has no attribute 'strip'
assert item["name"] == "Ada"
~~~

## Repair by validating the boundary
Use mapping operations for dictionaries and attribute syntax for objects designed with fields. If the API allows absence, handle None intentionally rather than swallowing every AttributeError.

~~~python
def display_name(record: dict | None) -> str:
    if record is None:
        return "(anonymous)"
    value = record.get("name")
    if not isinstance(value, str):
        raise TypeError("name must be a string")
    return value.strip()

assert display_name({"name": " Ada "}) == "Ada"
assert display_name(None) == "(anonymous)"
~~~

## Investigation
Print type(value) and repr(value) at the failing boundary without dumping passwords or personal records. Inspect the producer of the value, not only the consumer. A try/except AttributeError around a large code block can hide unrelated programming mistakes.

**Test:** pass an empty dictionary and confirm TypeError rather than a misleading fallback. Reference: https://docs.python.org/3/library/exceptions.html#AttributeError

## Inspect the value producer
~~~python
payload = {"user": {"name": "Ada"}}
assert payload["user"]["name"] == "Ada"
~~~
A dict does not offer `payload.user` by default. If a field can be absent, check the schema explicitly and distinguish a missing key from a value set to `None`. A data class or object with attributes has a different contract from a mapping. Your fix should be at the producer/consumer boundary, not an unrestricted `getattr(value, "name", "")` that masks malformed data.
