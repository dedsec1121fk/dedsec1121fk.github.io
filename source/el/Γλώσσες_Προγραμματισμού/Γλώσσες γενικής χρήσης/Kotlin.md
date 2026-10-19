# kotlin — συγκεντρωτικός οδηγός

## Kotlin

**Συνήθης χρήση:** Γλώσσες γενικής χρήσης.

**Προτεινόμενη επέκταση αρχείου:** `.kt`.

**Εκτέλεση / περιβάλλον:** Μεταγλώττιση kotlinc και εκτέλεση του JAR.

### Αρχικό παράδειγμα

```
fun greet(name: String) = "Hello, $name!"
fun main() { println(greet("Ada")) }
```

### Πώς διαβάζεται

Οι συναρτήσεις μπορούν να έχουν σύντομο σώμα και ρητούς nullable τύπους.

### Συνηθισμένο λάθος

Οι συναρτήσεις μπορούν να έχουν σύντομο σώμα και ρητούς nullable τύπους. Έλεγξε την έκδοση διερμηνευτή/μεταγλωττιστή και μην εκλαμβάνεις το δείγμα ως έτοιμη εφαρμογή παραγωγής.

### Καταστάσεις Android με σαφή τύπο
Το Kotlin null-safety εκφράζει την απουσία, αλλά Java/Android platform types χρειάζονται προσοχή. Προτίμησε immutable `val`, data classes και sealed types για loading/success/error.
```kotlin
sealed interface ResultState {
  data object Loading : ResultState
  data class Ready(val count: Int) : ResultState
  data class Failed(val message: String) : ResultState
}
fun label(state: ResultState): String = when (state) {
  ResultState.Loading -> "Loading"
  is ResultState.Ready -> "${state.count} results"
  is ResultState.Failed -> state.message
}
```
Μια Activity μπορεί να αναδημιουργηθεί· μην βασίζεσαι σε πεδία object για μόνιμα δεδομένα. Διαχώρισε UI state, storage και network. Μην μπλοκάρεις το main thread: coroutines με lifecycle-aware scope, cancellation και χειρισμό σφάλματος.

**Άσκηση:** οθόνη αναζήτησης με τρεις καταστάσεις, διατήρηση query μετά από περιστροφή και προσομοιωμένο network failure. Πηγή: https://kotlinlang.org/docs/home.html.

## Kotlin — Αναλυτικός οδηγός εξάσκησης

### Nullable δεν σημαίνει έγκυρο
Η Kotlin μπορεί να περιγράψει απουσία τιμής, αλλά και ένα μη-null String μπορεί να περιέχει άκυρο αριθμό. Χρησιμοποίησε toIntOrNull και ρητό έλεγχο εύρους· απέφυγε τον τελεστή !! σε μη έμπιστη είσοδο.

### Εκτέλεση JVM
Αποθήκευσε Main.kt και τρέξε kotlinc Main.kt -include-runtime -d demo.jar && java -jar demo.jar με Kotlin CLI και συμβατή Java. Περιμένεις Kotlin parser OK. Το συγκεκριμένο παράδειγμα δεν είναι build Android APK.

~~~kotlin
fun parsePort(raw: String?): Int? {
    val number = raw?.trim()?.toIntOrNull() ?: return null
    return if (number in 1..65535) number else null
}
fun main() {
    check(parsePort(" 443 ") == 443)
    check(parsePort(null) == null)
    check(parsePort("abc") == null)
    check(parsePort("70000") == null)
    println("Kotlin parser OK")
}
~~~

### Ανάλυση τύπων
Η ακολουθία safe calls επιστρέφει null για ανύπαρκτη είσοδο ή αποτυχημένη μετατροπή. Ο Elvis επιστρέφει άμεσα null από τη συνάρτηση χωρίς exception. Το if εφαρμόζει τον κανόνα 1..65535. Μετά την απομάκρυνση του nullable branch, το number είναι Int.

### Ασκήσεις
Δοκίμασε "+3", "-1", άδειο κείμενο, Unicode ψηφία, τελικά κενά και τεράστιο ακέραιο. Σκέψου αν η απουσία και η λανθασμένη τιμή πρέπει να επιστρέφουν το ίδιο null. Αν χρειάζεσαι αιτία αποτυχίας, σχεδίασε sealed hierarchy με Missing, InvalidText, OutOfRange, Valid.

### Διάγνωση
Το kotlinc χρειάζεται συμβατό JDK. Στο Android το Gradle και τα εργαλεία διαφέρουν από το CLI. Σύγκρινε εκδόσεις Kotlin/JDK πριν υποθέσεις ότι η null safety είναι το πρόβλημα. Μην κρύβεις unsafe casts με suppression.
Επιτυχία: τέσσερις έλεγχοι χωρίς NumberFormatException. https://kotlinlang.org/docs/null-safety.html

## Kotlin — Παραδείγματα πραγματικού κώδικα

### Εκτέλεση των παραδειγμάτων

Τα παραδείγματα είναι μικρά και αυτοτελή. Χρησιμοποίησε τη σχετική εγκατεστημένη γλώσσα. Ενδεικτικά: `kotlinc {file} -include-runtime -d demo.jar && java -jar demo.jar`. Μη συγχέεις τα ονόματα αρχείων με αυτόματη εγκατάσταση. Δούλεψε σε δοκιμαστικό φάκελο.


## Kotlin — Διαδρομή ουσιαστικής εξάσκησης

### Συμβόλαιο δεδομένων
Κάθε κίνηση είναι αμετάβλητη εγγραφή. Ο αναλυτής επιστρέφει μία από τις δύο σαφείς εκβάσεις: αποδοχή ή απόρριψη με αιτία. Δέχεται κωδικούς από A01 έως Z99, μη κενή κατηγορία και μη αρνητικό ποσό με ακριβώς δύο δεκαδικά ψηφία. Τα ποσά γίνονται ακέραια λεπτά χωρίς ανακρίβειες κινητής υποδιαστολής. Διπλός κωδικός συναλλαγής ή αριθμητική υπερχείλιση οδηγεί σε σφάλμα, όχι σε λανθασμένο σύνολο.

### Εκτελέσιμο παράδειγμα για JVM
Αποθήκευσε ως LedgerLab.kt. Εκτέλεσε kotlinc LedgerLab.kt -include-runtime -d ledger.jar και κατόπιν java -jar ledger.jar. Χρειάζονται JDK και μεταγλωττιστής Kotlin· δεν δημιουργούνται αρχεία δεδομένων ούτε απαιτείται σύνδεση δικτύου.

~~~kotlin
import java.math.BigDecimal

data class Entry(val id: String, val category: String, val cents: Long)
sealed interface Result {
    data class Accepted(val entry: Entry) : Result
    data class Rejected(val reason: String) : Result
}

fun parse(id: String, category: String, amount: String): Result {
    if (!id.matches(Regex("[A-Z][0-9]{2}"))) return Result.Rejected("id")
    if (category.isBlank()) return Result.Rejected("category")
    if (!amount.matches(Regex("[0-9]+\\.[0-9]{2}"))) return Result.Rejected("format")
    val cents = try {
        BigDecimal(amount).movePointRight(2).longValueExact()
    } catch (_: ArithmeticException) { return Result.Rejected("overflow") }
    return Result.Accepted(Entry(id, category, cents))
}

fun totals(input: List<Entry>): Map<String, Long> {
    require(input.map { it.id }.distinct().size == input.size) { "duplicate transaction" }
    return input.groupBy { it.category }
        .mapValues { (_, entries) -> entries.fold(0L) { sum, entry -> Math.addExact(sum, entry.cents) } }
}

fun main() {
    check(parse("A01", "food", "12.50") == Result.Accepted(Entry("A01", "food", 1250)))
    check(parse("A02", "food", "12.5") is Result.Rejected)
    check(parse("A03", "food", "99999999999999999999.00") is Result.Rejected)
    val a = (parse("A01", "food", "12.50") as Result.Accepted).entry
    val b = (parse("A04", "food", "0.10") as Result.Accepted).entry
    check(totals(listOf(a, b))["food"] == 1260L)
    check(totals(emptyList()).isEmpty())
    check(runCatching { totals(listOf(a, a)) }.isFailure)
    println("PASS: currency parsing, overflow and unique transaction IDs")
}
~~~

### Εξήγηση σχεδιασμού
Η data class επιτρέπει έλεγχο ισότητας βάσει τιμών. Με τις σφραγισμένες εκβάσεις Accepted και Rejected γνωρίζεις αν απέτυχε η ανάλυση χωρίς επικίνδυνες προσπελάσεις null. Η BigDecimal διατηρεί ακριβώς τα δεκαδικά ψηφία της εισόδου και η longValueExact εντοπίζει ποσά εκτός των ορίων της Long. Η Math.addExact προστατεύει και το άθροισμα: ακόμη και δύο έγκυρα ποσά μπορεί να έχουν μη αναπαραστάσιμο σύνολο.

### Περιορισμένες ασκήσεις και διαγνωστικά
1. Δοκίμασε 0.00, 00.01, -1.00, 1e3, NaN, 1.005 και κενή κατηγορία. Ξεχώρισε απόρριψη μορφής από υπερχείλιση.
2. Δημιούργησε δύο κατηγορίες. Βεβαίωσε ότι τα σύνολα υπολογίζονται ξεχωριστά. Πρόσθεσε διπλό κωδικό σε διαφορετικές κατηγορίες: πρέπει επίσης να απορριφθεί.
3. Με τεχνητές, πολύ μεγάλες εγγραφές, προκάλεσε υπερχείλιση στο Math.addExact και εξήγησε γιατί η χρήση Double δεν θα την έλυνε σωστά.
4. Δοκίμασε προσωρινά να αντικαταστήσεις την αποτυχία με null και σημείωσε ποια διαγνωστική πληροφορία χάνεται. Μετά επανάφερε τις σφραγισμένες εκβάσεις.

**Παραδοτέα:** μήνυμα PASS, πέντε αρνητικές δοκιμές, έλεγχος διπλού κωδικού και σύντομη διάκριση μεταξύ επικύρωσης εισόδου, ακριβούς μετατροπής και άθροισης. Μελλοντική εγγραφή σε αρχείο χρειάζεται δικό της ασφαλές πρωτόκολλο· η ακύρωση ασύγχρονης εργασίας δεν εγγυάται από μόνη της ατομικότητα.

## Kotlin — Τεχνικά σημεία και συχνές παγίδες

### Τεχνική γνώση

1. Η δυνατότητα null παρακολουθείται από τύπους, αλλά τα platform types της Java θέλουν προσοχή.
2. Τα data classes παράγουν χρήσιμες λειτουργίες για τις ιδιότητες του κύριου constructor.
3. Οι coroutines κάνουν συνεργατική αναστολή· επίλεξε κατάλληλο dispatcher για blocking εργασίες.
