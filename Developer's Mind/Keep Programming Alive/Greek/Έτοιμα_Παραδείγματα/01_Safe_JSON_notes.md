# Συνταγή: επικυρωμένες σημειώσεις JSON με ασφαλή αντικατάσταση

## Σενάριο και κριτήρια επιτυχίας
Αποθήκευσε μία μικρή λίστα με έως δέκα σημειώσεις για χρήση χωρίς διαδίκτυο. Κάθε εγγραφή πρέπει να περιέχει ακριβώς title και done· ο τίτλος έχει ένα έως 80 σημεία κώδικα και η κατάσταση ολοκλήρωσης είναι πραγματική λογική τιμή. Δημιούργησε το JSON πριν γράψεις, χρησιμοποίησε προσωρινό αρχείο στον ίδιο κατάλογο και αντικατάστησε το παλιό μόνο αφού ολοκληρωθούν επικύρωση και εγγραφή. Η άκυρη δοκιμή πρέπει να αφήνει τα προηγούμενα byte ανέπαφα.

## Πλήρες εκτελέσιμο παράδειγμα
Αποθήκευσε ως `01_Safe_JSON_notes.py` και εκτέλεσε με Python 3 και την ενσωματωμένη βιβλιοθήκη. Δεν απαιτείται διαδίκτυο ή πρόσβαση σε πραγματικά αρχεία σου.

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

## Τεχνική εξήγηση
Η μετατροπή σε JSON δεν επιβάλλει επιχειρησιακούς κανόνες: η συμβολοσειρά 'no' δεν είναι Boolean και ο κενός τίτλος δεν ταιριάζει με το μοντέλο. Όταν ολοκληρώσεις τη δημιουργία των byte πριν ανοίξεις αρχείο, αποτρέπεις μία καθυστερημένη αποτυχία σειριοποίησης από το να καταστρέψει την προηγούμενη αναφορά. Οι flush και fsync βελτιώνουν τη διατήρηση του προσωρινού αρχείου πριν την os.replace. Η μετονομασία δεν εγγυάται κάθε περίπτωση διακοπής ρεύματος ούτε ασφάλεια σε μη έμπιστο κατάλογο.

## Περιορισμένες ασκήσεις
Πρόσθεσε αναγνωριστικά σημειώσεων και όρισε αν πρέπει να είναι μοναδικά. Προκάλεσε διακοπή πριν την os.replace και βεβαιώσου ότι διατηρείται το παλιό αρχείο. Δοκίμασε ελληνικούς τόνους, emoji και άγνωστα πεδία. Εκτός από όριο πλήθους πρόσθεσε και όριο byte UTF-8 για ανεξέλεγκτο κείμενο.

## Διάγνωση και ασφάλεια
Αν ένα JSON δεν διαβάζεται, κατέγραψε JSONDecodeError χωρίς να διαγράψεις το αρχικό. Μην μετατρέπεις κάθε αποτυχία σε κενή λίστα, γιατί μπορεί να χάσεις ανακτήσιμα δεδομένα. Αν αποτύχει η εγγραφή στον δίσκο, κράτησε τον προηγούμενο προορισμό και εμφάνισε καθαρή αιτία.
