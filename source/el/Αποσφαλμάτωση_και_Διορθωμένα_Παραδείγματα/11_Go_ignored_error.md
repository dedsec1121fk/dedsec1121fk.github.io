# Go: αγνοημένο σφάλμα

## Λανθασμένο παράδειγμα — ΜΗ ΧΡΗΣΙΜΟΠΟΙΕΙΤΑΙ

```text
data, _ := os.ReadFile("notes.txt")
fmt.Println(string(data))
```

## Διορθωμένο παράδειγμα

```text
data, err := os.ReadFile("notes.txt")
if err != nil { return err }
fmt.Println(string(data))
```

## Αιτία σφάλματος και εξήγηση διόρθωσης

Μην απορρίπτεις σφάλματα αρχείων· το παράδειγμα ανήκει σε συνάρτηση που επιστρέφει error.

## Πλήρης άσκηση χειρισμού σφαλμάτων Go
Η παράβλεψη της δεύτερης επιστρεφόμενης τιμής του `os.ReadFile` μετατρέπει μια αποτυχία I/O σε κενό slice bytes. Έτσι ο caller μπορεί να τη μπερδέψει με κανονικό κενό αρχείο. Χρησιμοποίησε `%w` ώστε το αρχικό σφάλμα να διατηρείται για το `errors.Is`.

~~~go
package main
import ("errors"; "fmt"; "os")
func read(path string) ([]byte, error) {
    data, err := os.ReadFile(path)
    if err != nil { return nil, fmt.Errorf("read %q: %w", path, err) }
    return data, nil
}
func main() {
    f, err := os.CreateTemp("", "readlab-*")
    if err != nil { panic(err) }
    name := f.Name()
    defer os.Remove(name)
    if _, err := f.WriteString("hello"); err != nil { panic(err) }
    if err := f.Close(); err != nil { panic(err) }
    data, err := read(name)
    if err != nil || string(data) != "hello" { panic("read failed") }
    _, err = read(name + ".missing")
    if !errors.Is(err, os.ErrNotExist) { panic("missing file not detected") }
    fmt.Println("PASS")
}
~~~

Αποθήκευσε ως `readlab.go` και τρέξε `go run readlab.go`. Το πρόγραμμα δημιουργεί προσωρινό αρχείο, επαληθεύει το περιεχόμενο και ελέγχει ότι η απουσία αρχείου αναγνωρίζεται με `errors.Is(err, os.ErrNotExist)`. Ένα υπαρκτό κενό αρχείο επιστρέφει slice μηδενικού μήκους αλλά **nil** error· δεν είναι το ίδιο. Μην κρύβεις το σφάλμα ούτε να συνεχίζεις σαν να πέτυχε η εργασία. Σε κανονική εφαρμογή επίστρεψε το error στο επίπεδο που μπορεί να αποφασίσει για retry, μήνυμα ή διακοπή.
