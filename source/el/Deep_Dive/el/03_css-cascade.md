# Αποσφαλμάτωση CSS specificity και επικαλύψεων

## Τι συμβαίνει
Όταν κανόνας αγνοείται, έλεγξε το computed style αντί να προσθέτεις συνεχώς !important. Δες specificity, σειρά αρχείων, animation και κληρονομούμενες τιμές.

## Πρακτικός έλεγχος
Για επικαλυπτόμενες μπάρες έλεγξε position, z-index, isolation και stacking contexts. Ένα παιδί μπορεί να επαναφέρει visibility ενώ ο γονέας είναι κρυφός.

## Συνήθεις παγίδες
Κάνε browser regression test για ορατότητα και αντίθεση σε πλάτη 390px και 1280px. Διατήρησε ένδειξη focus πληκτρολογίου ακόμη κι αν αφαιρείς touch highlights.

## Μικρό παράδειγμα για προσαρμογή
```text
document.querySelector('.panel') && getComputedStyle(document.querySelector('.panel')).backgroundColor
```

## Ξεχώρισε απόκρυψη και stacking contexts
Ένας descendant μπορεί να υπερκαλύψει inherited `visibility:hidden` με `visibility:visible`. Δεν μπορεί να αναιρέσει ancestor με `display:none`, ενώ το opacity γονέα επηρεάζει ολόκληρο composited subtree. Πριν αλλάξεις z-index, βρες ποιος ακριβώς μηχανισμός κρύβει το control.
~~~css
.wrapper { position: relative; z-index: 1; }
.dialog { position: fixed; z-index: 9999; }
.peer { position: relative; z-index: 2; }
~~~
Αν το dialog ανήκει στο stacking context του wrapper, το μεγάλο τοπικό z-index δεν το βάζει αυτόματα πάνω από το ξεχωριστό context του peer. Εξέτασε όρια και ancestors με transform, opacity, isolation ή positioning μέσω developer tools. Αφαίρεσε το diagnostic outline μετά τη διερεύνηση.

Σε theme regression δες computed foreground και το πραγματικό background πίσω από το κείμενο. Η δήλωση CSS variable δεν αποδεικνύει ότι εφαρμόζεται· μπορεί να επικρατεί legacy selector ή important rule. Μετά από αλλαγή overlay hit-testing έλεγξε keyboard focus: ορατό κουμπί κάτω από άλλο element μπορεί να παραμένει μη λειτουργικό.
