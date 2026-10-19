# HTTP, JSON και όρια API

Μια διεπαφή στέλνει αιτήματα HTTP σε εξυπηρετητή. Έλεγξε τις εισόδους στον εξυπηρετητή και τους κωδικούς απόκρισης. Το πάτημα κουμπιού δεν αποδεικνύει αποθήκευση. Στο DedSec OS ακολούθησε το συμβάν ως το /api/ και το αρχείο.

## Λυμένο παράδειγμα

```text
import json
payload = {"ok": True, "count": 3}
encoded = json.dumps(payload)
print(json.loads(encoded)["count"])
```

## Άσκηση

Πρόσθεσε πεδίο "version" χωρίς να χαλάσεις τον υπάρχοντα καταναλωτή "count".

## Λύση / υπόδειξη

Ένα προαιρετικό πεδίο JSON διατηρεί τη συμβατότητα.

## Διαχώρισε δίκτυο, HTTP και λάθος δεδομένων
Μία αίτηση μπορεί να αποτύχει πριν φτάσει σε server (DNS, σύνδεση, TLS), να επιστρέψει HTTP error (400, 404, 429, 503) ή να έχει HTTP success με λανθασμένο JSON. Χρειάζονται timeout, έλεγχος δομής απάντησης και retries μόνο όταν η πράξη είναι ασφαλής για επανάληψη.
```python
import json
def read_items(response_text):
    obj=json.loads(response_text)
    if not isinstance(obj,dict) or not isinstance(obj.get("items"),list):
        raise ValueError("expected items array")
    return obj["items"]
assert read_items('{"items":[]}')==[]
```
Το `401` αφορά συνήθως credentials, `403` δικαίωμα, `404` πόρο και `429` ρυθμό. Μην επαναλαμβάνεις αυτόματα non-idempotent POST όπως μεταφορά χρημάτων.

**Άσκηση:** λανθασμένο JSON, λάθος root type, απουσία items· κάθε περίπτωση να δίνει καθαρό error.

## Δοκίμασε το συμβόλαιο API χωρίς πραγματικό δίκτυο

~~~python
import json
payload = json.loads('{"items":[{"id":1},{"id":2}]}')
assert [item["id"] for item in payload["items"]] == [1, 2]
try:
    json.loads('{"items":[')
except json.JSONDecodeError:
    pass
else:
    raise AssertionError("invalid JSON accepted")
~~~

Το HTTP 200 δεν αποδεικνύει ότι το περιεχόμενο έχει έγκυρο schema. Χαλασμένο JSON, πεδίο `items` που λείπει, απάντηση 404 και rate-limit 429 είναι **διαφορετικά** σφάλματα. Σε pagination σταμάτα όταν δεν υπάρχει τεκμηριωμένο next-page cursor, αντί να αναζητάς επ' άπειρον την πρώτη σελίδα. Μη γράφεις credentials στα logs. Χρησιμοποίησε stub αντί πραγματικής υπηρεσίας και σχεδίασε bounded retry/backoff μόνο για παροδική αποτυχία 503, όχι για μόνιμα άκυρα δεδομένα. Πηγή: https://www.rfc-editor.org/rfc/rfc9110
