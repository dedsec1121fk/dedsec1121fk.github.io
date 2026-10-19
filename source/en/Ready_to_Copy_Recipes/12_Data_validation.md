# Recipe: strict JSON configuration validation before applying settings

## Scenario and acceptance criteria
A local offline tool accepts a configuration with exactly mode, retries and tags. Mode may be offline or preview; retries must be an integer from zero through three; tags is a list containing at most five unique nonempty short strings. Reject extra fields before they become accidental capabilities, including a fabricated admin flag.

## Complete executable example
Save as `12_Data_validation.py` and run with Python 3 and the standard library. The fixture works without internet or access to your real files.

~~~python
import json
def validate_config(text):
    config=json.loads(text)
    if type(config) is not dict or set(config)!={"mode","retries","tags"}:
        raise ValueError("unexpected structure")
    if config["mode"] not in ("offline","preview"):
        raise ValueError("unsupported mode")
    if type(config["retries"]) is not int or not 0<=config["retries"]<=3:
        raise ValueError("retry limit")
    tags=config["tags"]
    if (type(tags) is not list or len(tags)>5 or
        any(type(x) is not str or not 1<=len(x)<=12 for x in tags)
        or len(set(tags))!=len(tags)):
        raise ValueError("invalid or duplicate tags")
    return config
good='{"mode":"offline","retries":1,"tags":["math","code"]}'
assert validate_config(good)["tags"]==["math","code"]
for bad in ('{"mode":"unknown","retries":1,"tags":[]}',
            '{"mode":"offline","retries":true,"tags":[]}',
            '{"mode":"offline","retries":1,"tags":["x","x"]}',
            '{"mode":"offline","retries":1,"tags":[],"admin":true}'):
    try: validate_config(bad)
    except ValueError: pass
    else: raise AssertionError("invalid configuration accepted")
print("PASS strict configuration domain checks")
~~~

## Technical explanation
json.loads checks JSON syntax, not schema intent. In Python, bool is a subclass of int, so `type(x) is int` prevents the JSON true value from slipping through numeric validation. The uniqueness check prevents duplicate tags while the explicit maximum bounds memory growth. Validated configuration data can still be unsafe if passed directly into SQL, HTML or shell commands; validate at the input boundary and encode again for the actual output context.

## Bounded practice
Test zero retries, three retries, an empty tag list, a sixth tag, a tag longer than 12 characters and an unknown mode. Change the validation order and confirm that duplicate tags remain rejected. Extend the design with a schema version and a documented migration instead of accepting arbitrary legacy keys. Ensure a failed validation never modifies persisted settings.

## Diagnostics and safety
When the JSON parser succeeds but the configuration is rejected, show which rule failed without dumping private settings into logs. For unknown keys, prefer explicit migration or rejection to silent coercion. Keep default values documented rather than inventing them after encountering malformed input.
