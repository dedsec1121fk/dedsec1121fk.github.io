# JSONDecodeError — εντόπισε το πρώτο άκυρο token

## Ερμηνεία
Η json.loads απαιτεί μία έγκυρη JSON τιμή. Trailing comma, μονά εισαγωγικά, HTML σελίδα σφάλματος ή κενό response δεν ταιριάζουν στο JSON grammar. Το exception δίνει γραμμή, στήλη και θέση χαρακτήρα.

~~~python
import json
from json import JSONDecodeError

bad = '{"enabled": true,}'
try:
    json.loads(bad)
except JSONDecodeError as exc:
    assert exc.lineno == 1
    print("invalid position:", exc.pos, "near:", repr(bad[max(0, exc.pos-8):exc.pos+8]))
~~~

## Διόρθωσε την πηγή
Σε HTTP έλεγξε status και Content-Type πριν κάνεις parsing. Ένα HTTP 500 με HTML δεν είναι JSON. Ο παραγωγός πρέπει να χρησιμοποιεί διπλά εισαγωγικά και όχι trailing commas. Αν επιτρέπεται άδειο αρχείο, όρισε τι σημαίνει πριν δημιουργήσεις default.

~~~python
valid = json.loads('{"enabled": true}')
assert valid["enabled"] is True
~~~

## Πείραμα
Δοκίμασε κενό κείμενο, 'null', πίνακα αντί αντικειμένου και έγκυρο JSON χωρίς το 'enabled'. Σωστό JSON δεν σημαίνει σωστό schema: μετά το parsing έλεγξε τύπο και υποχρεωτικά πεδία. Μη διορθώνεις τυχαίο κείμενο αφαιρώντας punctuation. Τεκμηρίωση: https://docs.python.org/3/library/json.html

## Διαχωρισμός JSON parsing από schema validation
~~~python
import json
def read_config(raw):
    obj = json.loads(raw)
    if not isinstance(obj, dict) or not isinstance(obj.get("enabled"), bool):
        raise ValueError("config.enabled must be boolean")
    return obj
~~~
Το `"null"` είναι **έγκυρο JSON** αλλά δεν είναι object ρυθμίσεων. Το `"{invalid}"` είναι άκυρη σύνταξη και πρέπει να δώσει `JSONDecodeError` πριν καν φτάσεις στο schema. Έλεγξε ακόμη `{"enabled": 1}` και `{"enabled": false}`: η Python θεωρεί το `bool` υποτύπο του `int`, οπότε απαιτείται ρητός έλεγχος boolean αντί για απλή σύγκριση με αριθμό. Αν η είσοδος έρχεται από HTTP, έλεγξε status και Content-Type· μια HTML σελίδα σφάλματος δεν διορθώνεται με αλλαγή του JSON decoder.
