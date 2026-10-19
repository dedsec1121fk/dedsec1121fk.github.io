# Γλωσσάρι: concurrency, conditions και containers

## Concurrency

### Τι σημαίνει στην πράξη
Concurrency σημαίνει ότι πολλές εργασίες προοδεύουν σε επικαλυπτόμενα χρονικά διαστήματα, όχι κατ' ανάγκη ταυτόχρονα. Parallelism είναι πραγματικά παράλληλη εκτέλεση. Ακόμη και interleaved tasks μπορούν να μοιράζονται state και να παράγουν ordering bugs.

### Συγκεκριμένο παράδειγμα
~~~python
import asyncio
async def job(i):
    await asyncio.sleep(0)
    return i * 2
async def main():
    return await asyncio.gather(job(1), job(2))
assert asyncio.run(main()) == [2, 4]
~~~

### Άσκηση και συχνή παγίδα
Έλεγξε ότι το gather επιστρέφει αποτελέσματα με τη σειρά των ορισμάτων, ακόμη και αν οι εργασίες τελειώνουν σε άλλη σειρά. Σύγκρινε cooperative I/O waits με CPU-heavy λειτουργίες που μπλοκάρουν το event loop: async δεν σημαίνει αυτόματα πολλούς CPU cores.

**Αναφορά:** https://docs.python.org/3/library/asyncio-task.html

## Condition

### Τι σημαίνει στην πράξη
Μια συνθήκη επιλέγει branch με βάση predicate. Η ορθότητα εξαρτάται από το ακριβές όριο: `>` και `>=` δεν είναι το ίδιο. Το `None`, το κενό string και το μηδέν μπορεί να θεωρούνται false χωρίς να σημαίνουν το ίδιο πράγμα.

### Συγκεκριμένο παράδειγμα
~~~python
def shipping_cost(total):
    if total < 0: raise ValueError('negative total')
    if total >= 50: return 0
    return 5
assert shipping_cost(49.99) == 5
assert shipping_cost(50) == 0
~~~

### Άσκηση και συχνή παγίδα
Δοκίμασε ακριβώς κάτω, στο και πάνω από το όριο των 50 μονάδων. Άλλαξε σειρά branches και δες μήπως αρνητική είσοδος γίνεται δεκτή. Προτίμησε `is None` όταν η απουσία δεν ταυτίζεται με μηδέν.

**Αναφορά:** https://docs.python.org/3/tutorial/controlflow.html#if-statements

## Container

### Τι σημαίνει στην πράξη
Ένα container πακετάρει processes, filesystem layers και runtime settings, αλλά βασίζεται στο kernel του host. Δεν είναι πλήρης virtual machine: μοιράζεται τον host kernel και απαιτεί προσεκτικές ρυθμίσεις σε network, users, capabilities και mounts.

### Συγκεκριμένο παράδειγμα
~~~sh
# On a machine with Docker and a trusted base image:
docker run --rm --network none --read-only alpine:3.20 sh -c 'id; uname -s'
~~~

### Άσκηση και συχνή παγίδα
Σε σύστημα με κατάλληλο runtime σύγκρινε `uname` μέσα και έξω από container και δοκίμασε read-only filesystem. Μη δίνεις mount στο home ή στο socket του container engine μόνο για να λειτουργήσει ένα demo: αλλάζει η ασφάλεια.

**Αναφορά:** https://docs.docker.com/engine/security/

## Coroutine

### Τι σημαίνει στην πράξη
Coroutine είναι υπολογισμός που μπορεί να αναστείλει και να συνεχίσει. Στην Python η κλήση `async def` δημιουργεί coroutine object και δεν ολοκληρώνει από μόνη της την εργασία. Το event loop οργανώνει τα `await` και τα scheduled tasks.

### Συγκεκριμένο παράδειγμα
~~~python
import asyncio
async def answer():
    await asyncio.sleep(0)
    return 42
assert asyncio.run(answer()) == 42
~~~

### Άσκηση και συχνή παγίδα
Δοκίμασε `created = answer()` χωρίς await και εξέτασε τον τύπο του. Κλείσε το προσωρινό coroutine όταν δεν το εκτελείς για να μη μείνει warning. Μέσα σε running loop χρησιμοποίησε `await`, όχι νέο `asyncio.run`.

**Αναφορά:** https://docs.python.org/3/library/asyncio-task.html
