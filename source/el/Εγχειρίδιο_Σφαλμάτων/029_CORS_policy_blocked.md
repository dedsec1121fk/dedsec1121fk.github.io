# CORS policy blocked — όρια προέλευσης browser

## Τι σημαίνει το μήνυμα
Η CORS εφαρμόζεται από browsers σε cross-origin requests. Ένα HTTP response μπορεί να φτάσει στο δίκτυο αλλά να μη διατίθεται στη JavaScript της σελίδας, επειδή λείπει κατάλληλο Access-Control-Allow-Origin. Μπορεί να αποτύχει ακόμη και το preflight OPTIONS πριν σταλεί το κανονικό αίτημα.

## Τοπικό παράδειγμα πολιτικής
Σελίδα από https://app.example.test καλεί https://api.example.test/data. Ο API server, όχι ο κώδικας fetch της σελίδας, ορίζει τα response headers:

~~~http
HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://app.example.test
Vary: Origin
Content-Type: application/json

{"ok":true}
~~~

## Μην καταργείς την προστασία
Το fetch mode: "no-cors" συνήθως επιστρέφει opaque response που δεν μπορείς να διαβάσεις. Δεν είναι διόρθωση. Με credentials δεν επιτρέπεται wildcard Access-Control-Allow-Origin. Για τέτοιες περιπτώσεις χρειάζονται συγκεκριμένα allowed origins και σωστό Access-Control-Allow-Credentials εφόσον δικαιολογείται.

## Εργαστήριο διάγνωσης
Στα browser DevTools εξέτασε Origin, OPTIONS preflight, response headers, status και redirects. Σύγκρινε απλό GET με POST που στέλνει Content-Type: application/json και συνήθως απαιτεί preflight. Ένα μη επιτρεπόμενο origin δεν πρέπει να μπορεί να διαβάσει περιεχόμενο. Η επιτυχία με curl δεν αποδεικνύει browser CORS policy, επειδή το curl δεν την εφαρμόζει.

Πηγή: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS

## Πότε εμφανίζεται πραγματικά CORS
Το CORS εφαρμόζεται από browser για πρόσβαση σε απαντήσεις μεταξύ διαφορετικών origins. Δεν είναι firewall ούτε εμποδίζει όλους τους clients να καλέσουν API. Άνοιξε τα browser Developer Tools και σύγκρινε το πραγματικό `Origin` με το `Access-Control-Allow-Origin` του response. Μια απλή `GET` μπορεί να μη χρειάζεται preflight, ενώ αίτημα με μη safelisted header ενδέχεται να ξεκινήσει με `OPTIONS`. Δοκίμασε δύο ελεγχόμενα requests για να δεις τη διαφορά. Για credentialed requests ο wildcard origin `*` δεν γίνεται αποδεκτός από τον browser. Η διόρθωση πρέπει να γίνει στην κατάλληλη πολιτική του εξυπηρετητή, όχι απενεργοποιώντας την ασφάλεια του browser ή προσθέτοντας τυχαία extensions.
