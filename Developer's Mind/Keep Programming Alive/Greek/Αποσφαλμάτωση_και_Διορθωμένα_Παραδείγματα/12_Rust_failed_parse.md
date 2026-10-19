# Παραδείγματα σφαλμάτων: Rust, PHP, TypeScript και Python

## Rust: αποτυχημένη μετατροπή

### Λανθασμένο παράδειγμα — ΜΗ ΧΡΗΣΙΜΟΠΟΙΕΙΤΑΙ

```text
let age: i32 = text.parse().unwrap();
```

### Διορθωμένο παράδειγμα

```text
let age: i32 = match text.parse() {
    Ok(n) => n,
    Err(_) => { eprintln!("invalid number"); return; }
};
```

### Αιτία σφάλματος και εξήγηση διόρθωσης

Απόφυγε panic σε λάθος είσοδο· το παράδειγμα είναι τμήμα της main().

### Η μετατροπή είναι επικύρωση, όχι βεβαιότητα
Το `unwrap()` σε κείμενο χρήστη προκαλεί panic όταν η μετατροπή αποτύχει. Επίστρεψε `Result` και ξεχώρισε τα λάθη σύνταξης από τους περιορισμούς της εφαρμογής. Ο τύπος `u8` απορρίπτει αρνητικούς και τιμές πάνω από 255 πριν τον έλεγχο του επιχειρησιακού κανόνα.

~~~rust
fn parse_age(text: &str) -> Result<u8, String> {
    let n: u8 = text.trim().parse()
        .map_err(|_| "expected an unsigned integer".to_string())?;
    if n > 120 { return Err("age outside accepted range".into()); }
    Ok(n)
}
fn main() {
    assert_eq!(parse_age("23"), Ok(23));
    assert!(parse_age("abc").is_err());
    assert!(parse_age("-1").is_err());
    assert!(parse_age("121").is_err());
    println!("PASS");
}
~~~

Αποθήκευσε ως `age.rs` και εκτέλεσε `rustc age.rs -o age && ./age` σε σύστημα με Rust. Τα assertions καλύπτουν κανονική είσοδο, γράμματα, αρνητική τιμή και αριθμό που παραβιάζει το επιτρεπτό όριο. Αν δεν έχεις Rust compiler, σημείωσε ότι ο έλεγχος εκτέλεσης εκκρεμεί αντί να δηλώσεις πως πέτυχε.

**Ενσωμάτωση:** ο caller πρέπει να χειρίζεται `Ok(age)` και `Err(message)` με σαφή απόκριση. Το `unwrap_or(0)` κρύβει λανθασμένη είσοδο εκτός αν το μηδέν είναι όντως έγκυρη εφεδρική τιμή.

## PHP: έξοδος HTML

### Λανθασμένο παράδειγμα — ΜΗ ΧΡΗΣΙΜΟΠΟΙΕΙΤΑΙ

```text
echo $_GET["name"];
```

### Διορθωμένο παράδειγμα

```text
echo htmlspecialchars($_GET["name"] ?? "", ENT_QUOTES, "UTF-8");
```

### Αιτία σφάλματος και εξήγηση διόρθωσης

Κάνε ασφαλή διαφυγή μη έμπιστου κειμένου πριν το HTML.

### Κωδικοποίηση εξόδου ανά περιβάλλον (PHP 8)
Ο browser ερμηνεύει το HTML ως markup και όχι ως απλό κείμενο. Η απευθείας εμφάνιση μη έμπιστων τιμών μπορεί να δημιουργήσει στοιχεία ή attributes. Κάνε escaping στο σημείο εμφάνισης για το **συγκεκριμένο** περιβάλλον εξόδου.

~~~php
<?php
function escapeHtml(string $value): string {
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}
$sample = '<strong>& "hello"</strong>';
$expected = '&lt;strong&gt;&amp; &quot;hello&quot;&lt;/strong&gt;';
if (escapeHtml($sample) !== $expected) {
    throw new RuntimeException('escaping regression');
}
echo escapeHtml($sample), PHP_EOL;
~~~

Εκτέλεσε `php html_lab.php`. Το assertion ελέγχει γωνιακές αγκύλες, ampersand και διπλά εισαγωγικά. Σε web handler επαλήθευσε πρώτα `is_string($_GET['name'] ?? '')`, επειδή οι παράμετροι μπορεί να είναι arrays· έπειτα χρησιμοποίησε `escapeHtml` για HTML text ή quoted attribute. Το `ENT_QUOTES` καλύπτει και τα δύο είδη εισαγωγικών, ενώ το `ENT_SUBSTITUTE` χειρίζεται μη έγκυρα bytes. Το UTF-8 πρέπει να συμφωνεί με το charset της απόκρισης.

**Όριο:** το HTML escaping δεν είναι γενικός καθαρισμός δεδομένων. JavaScript strings, URLs, CSS και SQL χρειάζονται διαφορετικό χειρισμό. Για κείμενο στο DOM προτίμησε `textContent` και για SQL δεσμευμένες παραμέτρους.

## TypeScript: παράκαμψη με any

### Λανθασμένο παράδειγμα — ΜΗ ΧΡΗΣΙΜΟΠΟΙΕΙΤΑΙ

```text
function double(x: any) { return x * 2; }
```

### Διορθωμένο παράδειγμα

```text
function double(x: number): number { return x * 2; }
```

### Αιτία σφάλματος και εξήγηση διόρθωσης

Διατήρησε ουσιαστικούς τύπους ώστε ο μεταγλωττιστής να εντοπίζει λάθη.

## Python: μη ασφαλής διαδρομή

### Λανθασμένο παράδειγμα — ΜΗ ΧΡΗΣΙΜΟΠΟΙΕΙΤΑΙ

```text
target = base / user_input
target.write_text("data")
```

### Διορθωμένο παράδειγμα

```text
target = (base / user_input).resolve()
if not target.is_relative_to(base.resolve()):
    raise ValueError("outside permitted folder")
target.write_text("data", encoding="utf-8")
```

### Αιτία σφάλματος και εξήγηση διόρθωσης

Έλεγξε ότι διαδρομές χρήστη μένουν εντός επιτρεπτού φακέλου (Python 3.9+).
