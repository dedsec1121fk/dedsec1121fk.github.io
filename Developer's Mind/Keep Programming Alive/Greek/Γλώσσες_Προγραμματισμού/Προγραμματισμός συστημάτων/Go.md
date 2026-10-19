# go — συγκεντρωτικός οδηγός

## Go

**Συνήθης χρήση:** Προγραμματισμός συστημάτων.

**Προτεινόμενη επέκταση αρχείου:** `.go`.

**Εκτέλεση / περιβάλλον:** go run main.go.

### Αρχικό παράδειγμα

```
package main
import "fmt"
func greet(name string) string { return "Hello, " + name + "!" }
func main() { fmt.Println(greet("Ada")) }
```

### Πώς διαβάζεται

Στη Go τα σφάλματα συχνά επιστρέφονται ρητά ως τιμές.

### Συνηθισμένο λάθος

Στη Go τα σφάλματα συχνά επιστρέφονται ρητά ως τιμές. Έλεγξε την έκδοση διερμηνευτή/μεταγλωττιστή και μην εκλαμβάνεις το δείγμα ως έτοιμη εφαρμογή παραγωγής.

### Go module με ρητά και ελεγμένα σφάλματα

Στη Go μια αναμενόμενη αποτυχία συνήθως επιστρέφεται ως error, όχι ως exception. Δημιούργησε module με τη συνάρτηση:

~~~go
package demo
import (
    "errors"
    "strconv"
)
func ParsePort(text string) (int, error) {
    n, err := strconv.Atoi(text)
    if err != nil { return 0, err }
    if n < 1 || n > 65535 { return 0, errors.New("port out of range") }
    return n, nil
}
~~~

Με go mod init example.com/demo δημιούργησε port_test.go και τρέξε go test:

~~~go
package demo
import "testing"
func TestParsePort(t *testing.T) {
    for _, tc := range []struct{ raw string; valid bool }{
        {"80", true}, {"0", false}, {"65536", false}, {"abc", false},
    } {
        _, err := ParsePort(tc.raw)
        if (err == nil) != tc.valid { t.Errorf("%s: err=%v", tc.raw, err) }
    }
}
~~~

Εξήγησε γιατί πρώτα ελέγχεται το σφάλμα Atoi και μετά το επιτρεπτό εύρος. Διαχώρισε error από panic: λανθασμένη είσοδος χρήστη είναι αναμενόμενη αποτυχία, όχι πάντοτε προγραμματιστικό σφάλμα. Μια goroutine δεν κάνει αυτόματα τον κώδικα ταχύτερο· πριν από concurrency χρειάζεται σκέψη για ακύρωση και κοινά δεδομένα.

**Επιτυχία:** περνούν τέσσερα tests, μια άκυρη πόρτα δεν επιστρέφεται ως έγκυρη και ο caller ελέγχει ρητά το err. Πηγές: https://go.dev/doc/tutorial/handle-errors και https://go.dev/doc/tutorial/add-a-test.

## Go — Αναλυτικός οδηγός εξάσκησης

### Γιατί χρειάζεται
Το struct περιγράφει τα αναμενόμενα πεδία, αλλά ο json.Decoder επιτρέπει συχνά άγνωστα κλειδιά. Ένα λάθος στο όνομα ρύθμισης μπορεί να περάσει απαρατήρητο. Απόρριψε άγνωστα πεδία, πρόσθεσε λογικά όρια και βεβαιώσου ότι δεν υπάρχει δεύτερο JSON.

### Εκτέλεση
Αποθήκευσε main.go και τρέξε go run main.go. Χρησιμοποιούνται μόνο standard packages. Περιμένεις offline 3. Τα τρία κακά δείγματα πρέπει να επιστρέψουν error, όχι να ενεργοποιήσουν το panic της δοκιμής.

~~~go
package main
import ("encoding/json"; "errors"; "fmt"; "io"; "strings")
type Config struct { Name string; Limit int }
func readConfig(raw string) (Config, error) {
    var c Config
    decoder := json.NewDecoder(strings.NewReader(raw))
    decoder.DisallowUnknownFields()
    if err := decoder.Decode(&c); err != nil { return c, err }
    if c.Name == "" || c.Limit < 1 || c.Limit > 100 {
        return c, errors.New("bad config values")
    }
    var extra interface{}
    if err := decoder.Decode(&extra); err != io.EOF {
        return c, errors.New("trailing JSON or invalid tail")
    }
    return c, nil
}
func main() {
    good, err := readConfig("{\"Name\":\"offline\",\"Limit\":3}")
    if err != nil { panic(err) }
    fmt.Println(good.Name, good.Limit)
    for _, raw := range []string{
        "{\"Name\":\"x\",\"Limt\":3}",
        "{\"Name\":\"x\",\"Limit\":0}",
        "{\"Name\":\"x\",\"Limit\":2} true",
    } {
        if _, err := readConfig(raw); err == nil { panic("bad data accepted") }
    }
}
~~~

### Εξήγηση
Η DisallowUnknownFields εντοπίζει το Limt αντί Limit. Μετά την πρώτη Decode, η δεύτερη πρέπει να επιστρέψει io.EOF· διαφορετικά υπάρχει επιπλέον περιεχόμενο. Κενό όνομα και τιμή έξω από 1..100 είναι κανόνες εφαρμογής, όχι σφάλματα σύνταξης JSON.

### Ανεξάρτητη άσκηση
Γράψε table-driven tests με testing.T για null, πίνακα, δεκαδικό αριθμό, δεύτερη JSON τιμή και λανθασμένο πεδίο. Πρόσεξε πως διπλά keys μπορεί να γίνουν δεκτά: χρειάζεται επιπλέον έλεγχος αν απαγορεύονται. Σε εισερχόμενα bytes από δίκτυο βάλε όριο μεγέθους πριν τη Decode.

### Διάγνωση
Δες go version και σε project τρέξε go mod init example/config και go test. Κράτα την αρχική αιτία σφάλματος με fmt.Errorf και %w. Μην εμφανίζεις μυστικά config στα logs.
Επιτυχία: offline 3 και απόρριψη τριών περιπτώσεων. https://pkg.go.dev/encoding/json

## Go — Παραδείγματα πραγματικού κώδικα

### Εκτέλεση των παραδειγμάτων

Τα παραδείγματα είναι μικρά και αυτοτελή. Χρησιμοποίησε τη σχετική εγκατεστημένη γλώσσα. Ενδεικτικά: `go run {file}`. Μη συγχέεις τα ονόματα αρχείων με αυτόματη εγκατάσταση. Δούλεψε σε δοκιμαστικό φάκελο.


## Go — Διαδρομή ουσιαστικής εξάσκησης

### Ο παραγωγός χρειάζεται τρόπο να σταματήσει
Η goroutine μπορεί να συνεχίζει όταν ο caller έχει πάψει να διαβάζει το κανάλι. Αν επιχειρεί αποστολή σε unbuffered channel χωρίς receiver, περιμένει επ' αόριστον. Το context παρέχει σήμα διακοπής το οποίο εξετάζεται από select.

~~~go
package main
import (
    "context"
    "fmt"
)
func worker(ctx context.Context, out chan<- int) {
    for n := 0; ; n++ {
        select {
        case <-ctx.Done():
            return
        case out <- n:
        }
    }
}
func main() {
    ctx, cancel := context.WithCancel(context.Background())
    out := make(chan int)
    go worker(ctx, out)
    fmt.Println(<-out)
    cancel()
}
~~~

Το πρόγραμμα δείχνει cancellation signal, όχι απόδειξη ότι ολοκληρώθηκε η worker πριν επιστρέψει το main. Για synchronization πρόσθεσε done := make(chan struct{}), defer close(done) στη worker, και αναμονή <-done μετά το cancel. Έτσι μπορείς να ισχυριστείς ότι η worker όντως τερμάτισε.

### Close ownership
Το κανάλι δεν κλείνει αυτόματα όταν σταματά μία goroutine. Το κλείσιμο από receiver ή από πολλούς senders χωρίς συντονισμό δημιουργεί κινδύνους panic. Σε pipeline με πολλούς producers χρησιμοποίησε WaitGroup και κλείσε το output αφού ολοκληρωθούν όλοι, από το κατάλληλο ownership scope.

### Διαχωρισμός race από deadlock
Ο race detector μπορεί να εντοπίσει πραγματικές ταυτόχρονες προσπελάσεις shared state, όχι κάθε μπλοκάρισμα και όχι απαραίτητα όλες τις σπάνιες διαδρομές εκτέλεσης. Μη βάζεις time.Sleep σαν «απόδειξη» συγχρονισμού· τα αποτελέσματα εξαρτώνται από scheduling.

### Κριτήρια αποδοχής
Δοκίμασε cancellation πριν το πρώτο receive και μετά από ένα receive, με bounded timeout μόνο στο test harness. Έπειτα επέκτεινε σε δύο workers που παράγουν τιμές και σε έναν collector που τερματίζει χωρίς leaks. Κατάγραψε έκδοση Go, test outputs, race detector αποτέλεσμα και ποιος κλείνει κάθε κανάλι. Η επιτυχία μιας εκτέλεσης δεν αποδεικνύει καθολική απουσία concurrency bugs.

## Go — Τεχνικά σημεία και συχνές παγίδες

### Τεχνική γνώση

1. Οι goroutines είναι ελαφριές ταυτόχρονες συναρτήσεις αλλά απαιτούν διαχείριση κύκλου ζωής.
2. Τα channels συντονίζουν επικοινωνία· το κλείσιμο δεν είναι γενικό εργαλείο τερματισμού.
3. Τα σφάλματα συνήθως επιστρέφονται ως τιμές και πρέπει να ελέγχονται.
