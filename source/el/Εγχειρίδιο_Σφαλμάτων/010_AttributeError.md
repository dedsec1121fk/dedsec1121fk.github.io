# Python AttributeError — λάθος πεδίο ή λάθος αντικείμενο;

## Δύο διαφορετικές αιτίες
Το AttributeError μπορεί να προκύψει από λάθος τύπο, typo σε ιδιότητα ή τιμή None. Δεν διορθώνονται όλες οι περιπτώσεις με τον ίδιο τρόπο.

~~~python
item = {"name": "Ada"}
# item.name               # dict χωρίς τέτοιο attribute
# None.strip()            # NoneType χωρίς strip
assert item["name"] == "Ada"
~~~

## Έλεγξε τα δεδομένα στην είσοδο
Στα dictionaries χρησιμοποίησε keys, ενώ σε αντικείμενα με πεδία χρησιμοποίησε attributes. Αν το API επιτρέπει None, χειρίσου την απουσία ρητά.

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

## Διάγνωση και τεστ
Δες type(value) και repr(value) στο σημείο αποτυχίας, χωρίς logs με κωδικούς ή προσωπικά στοιχεία. Έλεγξε τη συνάρτηση που παρήγαγε την τιμή, όχι μόνο εκείνη που απέτυχε. Μην βάζεις ένα μεγάλο try/except AttributeError που καταπίνει άσχετα bugs.

**Άσκηση:** δώσε άδειο dict και περίμενε TypeError αντί για εικονική επιτυχία. Πηγή: https://docs.python.org/3/library/exceptions.html#AttributeError

## Συγκεκριμένο τεστ για mapping και αντικείμενο
~~~python
payload = {"user": {"name": "Ada"}}
assert payload["user"]["name"] == "Ada"
~~~
Το `payload.user` δεν λειτουργεί σε συνηθισμένο `dict` επειδή τα κλειδιά προσπελαύνονται με αγκύλες. Ένα αντικείμενο ή `dataclass` με attributes έχει διαφορετική σύμβαση. Πρόσθεσε τεστ όπου το `user` λείπει, όπου είναι `None` και όπου είναι σωστό dict. Η απουσία κλειδιού δεν είναι το ίδιο με τιμή `None`. Μην χρησιμοποιείς παντού `getattr(x, "name", "")` απλώς για να εξαφανίσεις το exception· μπορεί να κρύψει λάθος δεδομένα από το προηγούμενο στάδιο.
