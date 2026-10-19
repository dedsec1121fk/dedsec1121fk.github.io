# Εικονίδια χωρίς σωστή συμπεριφορά δεν αρκούν για προσβασιμότητα

## Πληκτρολόγιο και touch είναι χωριστές δοκιμές
Ένα clickable εικονίδιο πρέπει να είναι link ή button με κατανοητό accessible name και ορατό focus. Μενού που λειτουργεί μόνο με hover δεν εξυπηρετεί keyboard ή πολλά κινητά. Όταν το UI ανοίγει panel, πρέπει να διατηρεί λογική σειρά focus και να γνωστοποιεί την κατάσταση στο assistive technology. Δοκίμασε zoom 200% και στενή οθόνη χωρίς να αποκρύπτονται ουσιαστικά controls.

~~~html
<nav aria-label="Knowledge sections">
  <a href="#programming">Programming</a>
  <a href="#troubleshooting">Troubleshooting</a>
</nav>
<button type="button" aria-expanded="false" aria-controls="details">More details</button>
<section id="details" hidden>Additional guide sections</section>
~~~

## Offline λειτουργία σημαίνει διαφορετικό περιβάλλον
Σε ιστοσελίδα που ανοίγει με `file://` ή τοπικό HTTP, σωστά relative paths είναι απαραίτητα. Εξωτερικές γραμματοσειρές, CDN scripts και δυναμικά API calls μπορεί να μην λειτουργούν χωρίς Internet. Έλεγξε CSS, εικόνες, scripts και search index με απενεργοποιημένο δίκτυο. Μερικοί browsers επιβάλλουν αυστηρότερους περιορισμούς file-origin από το localhost HTTP, επομένως τεκμηρίωσε τον πραγματικά υποστηριζόμενο τρόπο εκκίνησης.

## Χρήσιμη αναζήτηση
Τα αποτελέσματα χρειάζονται σαφείς τίτλους και κατάσταση «δεν βρέθηκε». Ο χρήστης πληκτρολογίου πρέπει να υποβάλλει, να καθαρίζει και να επιστρέφει στα αποτελέσματα χωρίς να χάνει το focus. Όταν αλλάζει γλώσσα, πρέπει να ενημερώνεται και το `lang` του document μαζί με τις ετικέτες.

## Αποδείξεις
Κατάγραψε σειρά tab, screenshots touch, zoom, offline search και βασικό έλεγχο προσβάσιμων ονομάτων. Ένα αυτόματο DOM test βρίσκει προβλήματα attributes αλλά δεν πιστοποιεί ολόκληρη την εμπειρία χρήσης.
