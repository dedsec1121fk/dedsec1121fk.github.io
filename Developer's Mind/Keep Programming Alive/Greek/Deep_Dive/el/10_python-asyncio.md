# Python asyncio tasks και ακύρωση

## Τι συμβαίνει
Το asyncio εκτελεί coroutines συνεργατικά σε event loop. Μπλοκαρισμένη εργασία δίσκου ή CPU μέσα σε coroutine μπορεί ακόμη να παγώσει τις υπόλοιπες.

## Πρακτικός έλεγχος
Βάλε ρητά timeouts για I/O δικτύου. Σε ακύρωση άφησε πόρους στο finally και άφησε το CancelledError να μεταδοθεί.

## Συνήθεις παγίδες
Χρησιμοποίησε TaskGroup όπου υποστηρίζεται για τη διαχείριση συγγενικών εργασιών ώστε οι εξαιρέσεις να μην αγνοούνται.

## Μικρό παράδειγμα για προσαρμογή
```text
python -c 'import asyncio; print(asyncio.__name__)'
```

## Παρατήρησε cleanup κατά το cancellation
~~~python
import asyncio

async def worker(started, cleaned):
    try:
        started.set()
        await asyncio.sleep(60)
    finally:
        cleaned.append('released')

async def main():
    started = asyncio.Event()
    cleaned = []
    task = asyncio.create_task(worker(started, cleaned))
    await started.wait()
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass
    assert cleaned == ['released']

asyncio.run(main())
~~~
Το event αποδεικνύει ότι ο worker μπήκε στην προστατευμένη περιοχή πριν ακυρωθεί. Έτσι το fixture δεν βασίζεται σε αυθαίρετο sleep. Η μεγάλη αναμονή ακυρώνεται και το test δεν περιμένει εξήντα δευτερόλεπτα. Με await του task παραλαμβάνεται η τελική cancellation κατάσταση. Worker που καταπίνει cancellation και επιστρέφει σιωπηλά μπορεί να χαλάσει structured-concurrency ownership.

Το TaskGroup απαιτεί Python 3.11+. Κράτησε blocking εργασία έξω από το event loop. Η ακύρωση ενός await δεν σταματά αυτόματα αυθαίρετη δουλειά που ήδη εκτελείται σε χωριστό thread.

Πηγή: [asyncio task behavior](https://docs.python.org/3/library/asyncio-task.html).
