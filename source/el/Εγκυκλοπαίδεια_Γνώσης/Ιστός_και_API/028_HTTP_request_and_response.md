# Τεχνολογίες web: HTTP, REST, cache, προσβασιμότητα και JavaScript

## Αίτημα και απάντηση HTTP

### Πρακτική εξήγηση
HTTP request έχει method, target και headers, ενώ response δίνει status, headers και πιθανώς body. Επιτυχημένη TCP σύνδεση δεν εγγυάται HTTP 2xx.

### Παράδειγμα
~~~http
GET /health HTTP/1.1
Host: example.test
Accept: application/json

HTTP/1.1 200 OK
Content-Type: application/json

{"ok":true}
~~~

### Πραγματική άσκηση
Σύγκρινε 200, 404 και 503. Πότε επιτρέπεται retry και πώς ελέγχεται Content-Type πριν από JSON parsing;

### Έλεγχος συμβολαίου
Για HTTP request and response εξήγησε πώς ο caller ξεχωρίζει έγκυρο αποτέλεσμα από silent failure. Δοκίμασε normal και boundary input και σημείωσε έκδοση και αποτέλεσμα.

## REST και μοντελοποίηση πόρων

### Πρακτική εξήγηση
Resource API χρησιμοποιεί σταθερά IDs και HTTP method semantics. GET πρέπει να είναι safe, PUT idempotent όταν εφαρμόζεται σωστά, ενώ επαναλαμβανόμενο POST ίσως δημιουργεί duplicates.

### Παράδειγμα
~~~http
GET /tasks/5 HTTP/1.1
Host: example.test

PUT /tasks/5 HTTP/1.1
Host: example.test
Content-Type: application/json

{"title":"Ready"}
~~~

### Πραγματική άσκηση
Σχεδίασε 404 για missing task 5 και δοκίμασε identical PUT δύο φορές. Εξήγησε πώς URI ταυτοποιεί resource.

### Έλεγχος συμβολαίου
Για REST and resource modeling εξήγησε πώς ο caller ξεχωρίζει έγκυρο αποτέλεσμα από silent failure. Δοκίμασε normal και boundary input και σημείωσε έκδοση και αποτέλεσμα.

## Προσωρινή αποθήκευση και ανανέωση

### Το πρόβλημα και η ουσία
Η φρεσκάδα και η διάρκεια αποθήκευσης δεν είναι ίδια. Το Cache-Control: max-age=60 επιτρέπει reuse όσο το response είναι fresh. Όταν παλιώσει, το If-None-Match ελέγχει το ETag. Το 304 επαναχρησιμοποιεί cached body υπό τους κανόνες cache· αλλαγή επιστρέφει 200.

### Παράδειγμα
~~~http
HTTP/1.1 200 OK
Cache-Control: public, max-age=60
ETag: "guide-v1"

GET /guide HTTP/1.1
If-None-Match: "guide-v1"
~~~

### Ανεξάρτητος έλεγχος
Σχεδίασε timeline: t=0 αποθήκευση 200, t=30 reuse, t=61 conditional request. Δοκίμασε 304 και νέο 200. Μην αποθηκεύεις δημόσια προσωποποιημένα responses· εξέτασε private, no-store και Vary.

**Επίσημη τεκμηρίωση:** https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching

## Προσβασιμότητα HTML

### Πρακτική εξήγηση
Accessible HTML μεταφέρει ρόλους και labels μέσω semantics: button είναι interactive, heading οργανώνει κείμενο και label ονομάζει control. Η εμφάνιση δεν αρκεί.

### Παράδειγμα
~~~html
<label for="search">Search lessons</label>
<input id="search" type="search">
<button type="button">Open results</button>
~~~

### Πραγματική άσκηση
Πλοηγήσου μόνο με keyboard, έλεγξε focus order και screen reader. Αντικατάστησε button με div και βρες ποια συμπεριφορά χάνεται.

### Έλεγχος συμβολαίου
Για HTML accessibility εξήγησε πώς ο caller ξεχωρίζει έγκυρο αποτέλεσμα από silent failure. Δοκίμασε normal και boundary input και σημείωσε έκδοση και αποτέλεσμα.

## Συμβάντα JavaScript και ασύγχρονη κατάσταση

### Πρακτική εξήγηση
Event handlers μπορούν να ξεκινήσουν async work με απαντήσεις εκτός σειράς. Ένα αυξανόμενο request ID αποτρέπει παλιά απάντηση από το να αντικαταστήσει νέα.

### Παράδειγμα
~~~javascript
let latest=0;
async function search(term,fetchRows){
  const ticket=++latest;
  const rows=await fetchRows(term);
  return ticket===latest?rows:null;
}
~~~

### Πραγματική άσκηση
Φτιάξε δύο controlled Promises, επίλυσε πρώτα τη νεότερη και έλεγξε ότι η παλιά αγνοείται. Ξεχώρισε debounce και stale-result cancellation.

### Έλεγχος συμβολαίου
Για JavaScript events and asynchronous state εξήγησε πώς ο caller ξεχωρίζει έγκυρο αποτέλεσμα από silent failure. Δοκίμασε normal και boundary input και σημείωσε έκδοση και αποτέλεσμα.
