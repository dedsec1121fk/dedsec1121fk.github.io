# Recipe: validated JSON notes with failure-safe replacement

## Scenario and acceptance criteria
Store a tiny offline checklist containing no more than ten notes. Each entry must have exactly title and done; the title must be between one and 80 code points and the completion flag must be a real Boolean. Serialize before writing, use a temporary file in the destination directory and replace the old file only when validation and writing succeed. The invalid-entry test must leave the previous bytes unchanged.

## Complete executable example
Save as `01_Safe_JSON_notes.py` and run with Python 3 and the standard library. The fixture works without internet or access to your real files.

~~~python
import json, os, tempfile
from pathlib import Path
def save_notes(destination, notes):
    if not isinstance(notes, list) or len(notes) > 10:
        raise ValueError("expected up to ten notes")
    if not all(isinstance(n, dict) and set(n)=={"title","done"}
               and type(n["title"]) is str and 1<=len(n["title"])<=80
               and type(n["done"]) is bool for n in notes):
        raise ValueError("invalid note schema")
    data = json.dumps(notes,ensure_ascii=False,sort_keys=True).encode("utf-8")
    dest = Path(destination)
    name = None
    try:
        with tempfile.NamedTemporaryFile(dir=dest.parent,prefix=".notes-",
                                         delete=False) as temp:
            name = temp.name
            temp.write(data)
            temp.flush()
            os.fsync(temp.fileno())
        os.replace(name,dest)
        name = None
    finally:
        if name is not None:
            Path(name).unlink(missing_ok=True)
with tempfile.TemporaryDirectory() as d:
    target=Path(d)/"notes.json"
    save_notes(target,[{"title":"Ελληνικά","done":False}])
    before=target.read_bytes()
    try: save_notes(target,[{"title":"","done":"no"}])
    except ValueError: pass
    else: raise AssertionError("invalid entry accepted")
    assert target.read_bytes()==before
    assert json.loads(before.decode("utf-8"))[0]["title"]=="Ελληνικά"
print("PASS schema-checked atomic JSON fixture")
~~~

## Technical explanation
JSON serialization does not validate business rules: a string 'no' is not a Boolean and an empty title violates the chosen model. Creating the entire byte payload before touching the filesystem prevents late JSON conversion errors from corrupting the old report. Flush and fsync improve durability of the temporary file before os.replace. A successful rename is not the same as guaranteed power-loss durability or safe handling of an attacker-controlled directory; production storage may need directory fsync and secure path ownership.

## Bounded practice
Add duplicate note identifiers and decide whether the schema should require unique IDs. Simulate an error before os.replace and verify that the previous file survives. Try Greek accents, emoji and unexpected properties. Enforce an encoded byte-size limit as well as a note-count limit before accepting user-controlled strings.

## Diagnostics and safety
If a JSON file fails to load, capture JSONDecodeError without deleting or overwriting the original. Do not simply treat every parse failure as an empty checklist: doing so may erase recoverable user data. When an OS write fails, preserve the old destination and report a meaningful error.
