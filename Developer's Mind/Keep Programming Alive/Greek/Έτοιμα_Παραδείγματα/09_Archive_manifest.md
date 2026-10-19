# Συνταγή: περιορισμένο ευρετήριο ZIP χωρίς εξαγωγή στον δίσκο

## Πότε χρησιμοποιείται και τι πρέπει να επιτύχει
Πριν εξαγάγεις εκπαιδευτικό πακέτο για χρήση χωρίς διαδίκτυο, έλεγξε τα μέλη του και δημιούργησε σταθερό κατάλογο ονόματος, ασυμπίεστου μεγέθους και SHA-256. Απόρριψε διπλά ονόματα, απόλυτες διαδρομές, ανάβαση σε γονικό κατάλογο και περιεχόμενο πάνω από το προκαθορισμένο συνολικό όριο. Το δοκιμαστικό ZIP κατασκευάζεται αποκλειστικά στη μνήμη και δεν γράφονται μη έμπιστα αρχεία στον δίσκο.

## Πλήρες εκτελέσιμο παράδειγμα
Αποθήκευσε ως `09_Archive_manifest.py` και εκτέλεσε με Python 3. Χρησιμοποιούνται προσωρινά δεδομένα και δεν απαιτείται δίκτυο.

~~~python
import hashlib, io, zipfile
def manifest(zip_bytes, total_limit=2048):
    entries, seen, total = [], set(), 0
    with zipfile.ZipFile(io.BytesIO(zip_bytes)) as archive:
        for entry in archive.infolist():
            name = entry.filename
            if (name in seen or name.startswith("/") or "\\" in name or
                    any(x in ("", ".", "..") for x in name.split("/"))):
                raise ValueError("unsafe or duplicate member")
            seen.add(name)
            total += entry.file_size
            if total > total_limit or entry.file_size > total_limit:
                raise ValueError("archive content over limit")
            data = archive.read(entry)
            entries.append((name,len(data),hashlib.sha256(data).hexdigest()))
    return sorted(entries)
buffer = io.BytesIO()
with zipfile.ZipFile(buffer,"w",zipfile.ZIP_STORED) as out:
    out.writestr("docs/a.txt",b"alpha")
    out.writestr("assets/icon.txt",b"icon")
items = manifest(buffer.getvalue())
assert [x[0] for x in items] == ["assets/icon.txt","docs/a.txt"]
assert items[1][1] == 5
try: manifest(buffer.getvalue(),3)
except ValueError: pass
else: raise AssertionError("archive limit ignored")
print("PASS bounded ZIP manifest")
~~~

## Εγγυήσεις και περιορισμοί
Η ZipInfo.file_size περιγράφει το ασυμπίεστο μέγεθος που δηλώνει το ZIP. Το παράδειγμα ελέγχει επίσης τα byte που πραγματικά διαβάζει και υπολογίζει αποτυπώματα, αλλά προορίζεται μόνο για μικρά αρχεία. Κακόβουλα ZIP μπορούν να περιέχουν συμβολικούς συνδέσμους στα μεταδεδομένα, ασυνήθιστη συμπίεση, προβληματικά ονόματα ή τεράστιο λόγο αποσυμπίεσης. Η ασφαλής εξαγωγή χρειάζεται επιπλέον ελέγχους και πραγματικά όρια κατά τη ροή αποσυμπίεσης.

## Εργαστήριο προσαρμογής
Πρόσθεσε τρίτο έγκυρο μέλος και έλεγξε τη σειρά του καταλόγου. Εισήγαγε `../outside.txt` και επιβεβαίωσε απόρριψη. Δοκίμασε ίδιο όνομα δύο φορές, εγγραφή καταλόγου, υπέρβαση συνολικού μεγέθους και αλλοιωμένο ZIP. Ξεχώρισε τον έλεγχο μεταδεδομένων από την ασφάλεια των αρχείων μετά την εξαγωγή.

## Αντιμετώπιση προβλημάτων
Αν ένα μέλος απορρίπτεται, εμφάνισε με ασφαλή τρόπο το πραγματικό όνομά του, όχι υποτιθέμενη διορθωμένη διαδρομή. Μικρό συμπιεσμένο αρχείο μπορεί να καταλαμβάνει τεράστιο χώρο μετά την εξαγωγή· βάλε όρια σε συνολικά byte και πλήθος εγγραφών. Μη χρησιμοποιείς extractall σε μη έμπιστη είσοδο χωρίς ξεχωριστό έλεγχο ασφαλείας.
