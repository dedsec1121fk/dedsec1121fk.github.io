# Μηχανές καταστάσεων — λήψη μόνο μετά από συγκατάθεση

## Συμβόλαιο λειτουργίας
Σχεδίασε ελεγκτή λήψης με καταστάσεις new, ready, active, paused, blocked, done και failed. Πραγματική δικτυακή λειτουργία επιτρέπεται μόνο αφού υπάρξει νόμιμη μετάβαση από ready σε active. Νέο αίτημα δεν ξεκινά πριν από ρητή αποδοχή. Η άρνηση οδηγεί σε blocked χωρίς συντόμευση προς active. Τα γεγονότα έχουν συγκεκριμένους κανόνες και ένα μη επιτρεπτό ζεύγος πρέπει να προκαλεί σφάλμα, όχι να αλλάζει αυθαίρετα την κατάσταση. Το παράδειγμα εξετάζει μόνο τη λογική, χωρίς πραγματικές λήψεις.

## Εκτελέσιμο πρόγραμμα Python 3
Αποθήκευσε ως state_lab.py και εκτέλεσε python3 state_lab.py. Οι δοκιμές ελέγχουν επιτρεπόμενες μεταβάσεις, τέσσερις απορριπτέες ενέργειες και ότι όλες οι δηλωμένες καταστάσεις είναι προσιτές.

~~~python
from collections import deque

NEXT = {
    ('new', 'accept'): 'ready', ('new', 'decline'): 'blocked',
    ('ready', 'start'): 'active', ('active', 'pause'): 'paused',
    ('paused', 'resume'): 'active', ('active', 'finish'): 'done',
    ('active', 'fail'): 'failed', ('failed', 'retry'): 'ready'
}

def step(state, event):
    try: return NEXT[(state, event)]
    except KeyError as exc: raise ValueError(f'forbidden: {state}/{event}') from exc

assert step('new', 'accept') == 'ready'
assert step('ready', 'start') == 'active'
assert step('active', 'pause') == 'paused'
assert step('paused', 'resume') == 'active'
assert step('active', 'finish') == 'done'
for forbidden in [('new', 'start'), ('blocked', 'start'),
                  ('done', 'start'), ('paused', 'finish')]:
    try: step(*forbidden)
    except ValueError: pass
    else: raise AssertionError('invalid transition accepted')
seen, queue = {'new'}, deque(['new'])
while queue:
    state = queue.popleft()
    for (source, event), destination in NEXT.items():
        if state == source and destination not in seen:
            seen.add(destination)
            queue.append(destination)
assert seen == {'new', 'ready', 'active', 'paused', 'blocked', 'done', 'failed'}
print('PASS state: consent boundary, illegal events and reachable states')
~~~

## Τι αποδεικνύει ο έλεγχος
Ο πίνακας NEXT περιγράφει ρητά τα επιτρεπτά βήματα. Η step επιστρέφει τη νέα κατάσταση χωρίς να μεταβάλλει κοινόχρηστα δεδομένα: σε ValueError ο καλών μπορεί να κρατήσει την προηγούμενη έγκυρη κατάσταση. Η αναζήτηση κατά πλάτος εξετάζει ότι και οι επτά καταστάσεις μπορούν να προκύψουν από τη new με επιτρεπόμενα γεγονότα. Δεν εγγυάται ότι μία πραγματική εφαρμογή αποτρέπει όλες τις παρακάμψεις. Ξεχωριστός προσαρμογέας πρέπει να ξεκινά τη δικτυακή λειτουργία μόνο μετά από έγκυρη ready/start. Οι ασύγχρονες απαντήσεις, η ακύρωση, η απελευθέρωση πόρων, οι επαναλήψεις και τα διπλά πατήματα χρειάζονται πρόσθετες δοκιμές. Η ύπαρξη κουμπιού λήψης δεν αποτελεί απόδειξη συγκατάθεσης.

## Σαφείς ασκήσεις και έλεγχοι
1. Δημιούργησε πλήρη πίνακα κατάστασης και γεγονότος. Κάθε μη δηλωμένο ζεύγος πρέπει να προκαλεί ValueError.
2. Πρόσθεσε κατάσταση cancelled. Αποφάσισε από ποιες καταστάσεις επιτρέπεται η ακύρωση και τι πρέπει να κάνει η δεύτερη προσπάθεια.
3. Πρόσθεσε ψεύτικο προσαρμογέα που καταγράφει αιτήματα start. Επιβεβαίωσε ότι δεν υπάρχουν εγγραφές μετά από new/start ή blocked/start.
4. Προσομοίωσε διπλό active/pause, failed/retry και active/finish. Εξήγησε πότε επιτρέπεται επανάληψη και γιατί δεν γίνεται πραγματική σύνδεση στο διαδίκτυο.

**Παραδοτέα:** PASS, πίνακας μεταβάσεων, κανόνας συγκατάθεσης και σχέδιο δοκιμής του πραγματικού μηχανισμού λήψης.
