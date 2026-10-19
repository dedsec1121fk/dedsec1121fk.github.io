# NullPointerException — βρες την πραγματική είσοδο του null

## Τι σημαίνει η αποτυχία
Η Java εμφανίζει NullPointerException όταν μία πράξη που απαιτεί αντικείμενο λαμβάνει null. Συνηθισμένο παράδειγμα είναι η κλήση μεθόδου σε αποτέλεσμα Map.get(key) για κλειδί που λείπει. Ορισμένες υλοποιήσεις Map επιτρέπουν και πραγματικές null τιμές, συνεπώς το null δεν λέει πάντα γιατί λείπει το αποτέλεσμα. Το stack trace δείχνει την αποαναφορά, όχι απαραίτητα το σημείο όπου χάθηκε η τιμή.

## Ελεγχόμενη λύση
Όρισε καθαρή διεπαφή: null χάρτης ή κλειδί αποτελεί λάθος χρήσης του API, ενώ ανύπαρκτη ρύθμιση είναι ξεχωριστή επιχειρησιακή αποτυχία. Η Objects.requireNonNull δίνει συγκεκριμένο μήνυμα για απαγορευμένα null ορίσματα. Πριν καλέσουμε strip, ελέγχουμε ότι η τιμή είναι υπαρκτή και όχι κενή. Έτσι μία αναμενόμενη έλλειψη ρύθμισης μετατρέπεται σε σαφές IllegalArgumentException.

## Παράδειγμα κώδικα
Αποθήκευσε ως NullSafetyLab.java.

~~~java
import java.util.Map;
import java.util.Objects;
public class NullSafetyLab {
    static String label(Map<String, String> config, String key) {
        Objects.requireNonNull(config, "config map is required");
        Objects.requireNonNull(key, "lookup key is required");
        String value = config.get(key);
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("missing or blank setting: " + key);
        }
        return value.strip();
    }
    public static void main(String[] args) {
        if (!"ready".equals(label(Map.of("mode", " ready "), "mode"))) throw new AssertionError();
        try {
            label(Map.of(), "mode");
            throw new AssertionError("missing key accepted");
        } catch (IllegalArgumentException expected) {
            if (!expected.getMessage().contains("mode")) throw new AssertionError();
        }
        try {
            label(null, "mode");
            throw new AssertionError("null map accepted");
        } catch (NullPointerException expected) {
            if (!"config map is required".equals(expected.getMessage())) throw new AssertionError();
        }
        System.out.println("PASS: explicit API contract and missing-key diagnosis");
    }
}
~~~

## Γιατί λειτουργεί
Οι δοκιμές χρησιμοποιούν αμετάβλητα τοπικά δεδομένα και καλύπτουν σωστή τιμή, ανύπαρκτο κλειδί και null χάρτη. Ο καλών ελέγχει συγκεκριμένο τύπο εξαίρεσης και το μήνυμά της, αντί να καταπίνει κάθε RuntimeException. Η Optional δεν αντικαθιστά αυτόματα κάθε έλεγχο null: αποφάσισε πού επιτρέπεται η απουσία και πού παραβιάζει το συμβόλαιο.

## Ασφαλής επαλήθευση
Με Java 11 ή νεότερη εκτέλεσε javac NullSafetyLab.java && java NullSafetyLab, επειδή χρησιμοποιούνται οι isBlank και strip. Κατάγραψε java -version και javac -version αν εμφανιστεί ασυμβατότητα μεταγλώττισης ή εκτέλεσης. Αναμενόμενη έξοδος PASS.

## Άσκηση και αποδεικτικά
Αφαίρεσε προσωρινά τον έλεγχο της τιμής και πρόβλεψε ποια έκφραση προκαλεί NPE όταν το Map.get επιστρέφει null. Επανέφερε τον έλεγχο και δοκίμασε κενό ή λευκό κείμενο καθώς και null κλειδί. Σύγκρινε τους τύπους εξαίρεσης που αναλογούν σε κάθε παραβίαση. Μην καταγράφεις κωδικούς πρόσβασης κατά τη διάγνωση ρυθμίσεων.

**Πρωτογενής τεκμηρίωση:** https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Objects.html
