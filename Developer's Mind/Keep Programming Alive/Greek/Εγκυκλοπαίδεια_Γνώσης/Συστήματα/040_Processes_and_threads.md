# Διεργασίες, νήματα, συνθήκες συναγωνισμού και κλειδώματα

## Διεργασίες και νήματα

**Κατηγορία:** Συστήματα

### Βασική γνώση

Οι διεργασίες έχουν συνήθως ξεχωριστή μνήμη, ενώ τα νήματα μοιράζονται χώρο στην ίδια διεργασία. Η ταυτόχρονη εκτέλεση βελτιώνει την απόκριση αλλά εισάγει συγχρονισμό.

### Πρακτική εφαρμογή

Σύγκρινε διεργασία εργασίας με δύο νήματα που αλλάζουν κοινό μετρητή.

### Πώς λειτουργεί πραγματικά το σύστημα
Process έχει δικό του address space και OS resources, ενώ threads του ίδιου process μοιράζονται μνήμη αλλά έχουν ξεχωριστά stacks. Τα threads βοηθούν σε blocking I/O, ενώ CPU parallelism εξαρτάται από runtime. Το συνηθισμένο CPython GIL δεν αποτελεί μηχανισμό synchronization.

### Ελεγχόμενο εκτελέσιμο πείραμα
```python
import threading
seen=[]
def record(x): seen.append(x)
threads=[threading.Thread(target=record,args=(i,)) for i in range(3)]
for t in threads: t.start()
for t in threads: t.join()
assert sorted(seen)==[0,1,2]
```

### Ανάλυση σφάλματος και επέκταση
Άλλαξε το append σε σύνθετο read/modify/write και προστάτευσέ το με Lock. Σύγκρινε thread scheduling με multiprocessing.Queue όπου τα δεδομένα μεταφέρονται μεταξύ processes.

**Πηγή:** https://docs.python.org/3/library/threading.html

## Συνθήκες συναγωνισμού και κλειδώματα

**Κατηγορία:** Συστήματα

### Βασική γνώση

Race condition υπάρχει όταν το αποτέλεσμα εξαρτάται από απρόβλεπτη σειρά ενεργειών. Προτίμησε ανταλλαγή μηνυμάτων ή αμετάβλητα δεδομένα· τα locks χρειάζονται συνεπή σειρά κτήσης.

### Πρακτική εφαρμογή

Εξήγησε γιατί «διάβασε-αύξησε-γράψε» δεν είναι αυτόματα ατομικό.

### Πώς λειτουργεί πραγματικά το σύστημα
Race condition σημαίνει ότι η ορθότητα εξαρτάται από αβέβαιη σειρά εκτέλεσης. Lock πρέπει να προστατεύει όλο το read-modify-write critical section, όχι χωριστά την ανάγνωση και εγγραφή. Mutex δίνει αποκλειστικότητα αλλά υπερβολικά locks προκαλούν contention ή deadlock.

### Ελεγχόμενο εκτελέσιμο πείραμα
```python
import threading
counter=[0]; lock=threading.Lock()
def increment():
    for _ in range(1000):
        with lock: counter[0]+=1
threads=[threading.Thread(target=increment) for _ in range(2)]
for t in threads:t.start()
for t in threads:t.join()
assert counter[0]==2000
```

### Ανάλυση σφάλματος και επέκταση
Πρόσθεσε δεύτερο lock και περιέγραψε αντίστροφη σειρά acquisition που θα προκαλούσε deadlock. Διόρθωσε με κοινή lock order και κάνε δοκιμές μόνο με timeout.

**Πηγή:** https://docs.python.org/3/library/threading.html#lock-objects
