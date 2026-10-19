# Προσβάσιμα accordions και πλοήγηση

## Τι συμβαίνει
Για αναδιπλούμενο περιεχόμενο τα native details και summary υποστηρίζουν πληκτρολόγιο. Προσαρμοσμένο accordion χρειάζεται button, aria-expanded και αντίστοιχη περιοχή.

## Πρακτικός έλεγχος
Μην προσθέτεις ανταγωνιστικά click listeners στο ίδιο στοιχείο. Έλεγξε expanded κατάσταση και πραγματικό ύψος panel, όχι μόνο μια CSS κλάση.

## Συνήθεις παγίδες
Διατήρησε λογική ιεραρχία h1 έως h3 και πρόσθεσε ονόματα σε κουμπιά μόνο με εικονίδιο. Το mobile UI πρέπει να εξηγείται χωρίς εικονίδια.

## Μικρό παράδειγμα για προσαρμογή
```text
<details><summary>Show installation steps</summary><p>Validated commands.</p></details>
```

## Δοκίμασε το πραγματικό control του disclosure
~~~html
<details>
  <summary>Show prerequisites</summary>
  <p>Use a disposable workspace and an available interpreter.</p>
</details>
~~~
Πήγαινε στο summary με Tab και χρησιμοποίησε Enter ή Space. Παρατήρησε open property και διαθεσιμότητα παραγράφου. Μην προσθέτεις δεύτερο toggle που αναιρεί αμέσως τη default πράξη του browser. Αν framework αντικαθιστά element, έλεγξε ότι το focus δεν χάνεται στο document body.

Σε custom panel το aria-controls του button πρέπει να δείχνει υπαρκτό region και το aria-expanded να συμφωνεί με το πραγματικό visible state. Το ARIA δεν υλοποιεί μόνο του keyboard handling ή εμφάνιση. Link σημαίνει πλοήγηση, button ενέργεια. Τα icon-only controls χρειάζονται όνομα που περιγράφει την πράξη στη σωστή γλώσσα. Δοκίμασε zoom 200% και μεγάλο ελληνικό label, ώστε το target να μην κόβεται από fixed-height toolbar.

Δοκίμασε κλείσιμο και ξανά άνοιγμα μετά από αλλαγή γλώσσας: το accessible name και το ορατό label πρέπει να συμφωνούν, χωρίς δεύτερο button πάνω στο ίδιο summary.
