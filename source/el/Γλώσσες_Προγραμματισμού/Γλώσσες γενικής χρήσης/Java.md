# java — συγκεντρωτικός οδηγός

## Java

**Συνήθης χρήση:** Γλώσσες γενικής χρήσης.

**Προτεινόμενη επέκταση αρχείου:** `.java`.

**Εκτέλεση / περιβάλλον:** javac Main.java && java Main.

### Αρχικό παράδειγμα

```
public class Main {
  static String greet(String name) { return "Hello, " + name + "!"; }
  public static void main(String[] args) { System.out.println(greet("Ada")); }
}
```

### Πώς διαβάζεται

Το όνομα αρχείου πρέπει να ταιριάζει με τη δημόσια κλάση.

### Συνηθισμένο λάθος

Το όνομα αρχείου πρέπει να ταιριάζει με τη δημόσια κλάση. Έλεγξε την έκδοση διερμηνευτή/μεταγλωττιστή και μην εκλαμβάνεις το δείγμα ως έτοιμη εφαρμογή παραγωγής.

## Java — Αναλυτικός οδηγός εξάσκησης

### Πρόβλημα
Το CLI διαβάζει κείμενο, αλλά η θύρα πρέπει να είναι ακέραιος στο 1..65535. Η μετατροπή και η επικύρωση είναι διαφορετικές εργασίες. Κράτησε την αρχική NumberFormatException ως cause, αντί να κρύβεις λανθασμένη είσοδο με προεπιλογή.

### Εκτέλεση
Αποθήκευσε τη δημόσια κλάση ως Main.java και τρέξε javac Main.java && java Main με JDK. Περιμένεις validated. Το όνομα αρχείου πρέπει να ταιριάζει ακριβώς με την public class.

~~~java
public class Main {
  static int port(String raw) {
    if (raw == null) throw new IllegalArgumentException("missing port");
    final int number;
    try {
      number = Integer.parseInt(raw.trim());
    } catch (NumberFormatException ex) {
      throw new IllegalArgumentException("not a number", ex);
    }
    if (number < 1 || number > 65535) throw new IllegalArgumentException("bad range");
    return number;
  }
  static void rejects(String value) {
    try {
      port(value);
    } catch (IllegalArgumentException expected) {
      return;
    }
    throw new AssertionError("accepted invalid port");
  }
  public static void main(String[] args) {
    if (port(" 8080 ") != 8080) throw new AssertionError();
    rejects("0"); rejects("65536"); rejects("abc");
    System.out.println("validated");
  }
}
~~~

### Κατανόηση των exceptions
Η NumberFormatException είναι υποτύπος της IllegalArgumentException. Το try καλύπτει μόνο τη μετατροπή, όχι τον έλεγχο εύρους. Δες την αλυσίδα cause για "abc" και σύγκρινε με "65536". Η εντολή assert στην Java συνήθως είναι απενεργοποιημένη αν δεν τρέξεις με -ea. Εδώ το AssertionError λειτουργεί ανεξάρτητα.

### Επέκταση
Πρόσθεσε null, μόνο κενά, "-1", "65535", υπερβολικά μεγάλο ακέραιο και πρόσημο +. Αποφάσισε αν το + επιτρέπεται, επειδή ο parser της Java το δέχεται. Πέρασε σε JUnit αφού καταλάβεις πρώτα τις δοκιμές χωρίς εξαρτήσεις.

### Διάγνωση
Σύγκρινε java -version και javac -version. Το UnsupportedClassVersionError εμφανίζεται όταν το runtime είναι παλαιότερο από το bytecode. Το Cannot find symbol συνήθως δείχνει όνομα ή import που λείπει. Βρες το πρώτο σχετικό frame του δικού σου κώδικα.
Επιτυχία: μία έγκυρη τιμή, τρεις απορρίψεις. https://docs.oracle.com/en/java/javase/

## Java — Παραδείγματα πραγματικού κώδικα

### Εκτέλεση των παραδειγμάτων

Τα παραδείγματα είναι μικρά και αυτοτελή. Χρησιμοποίησε τη σχετική εγκατεστημένη γλώσσα. Ενδεικτικά: `javac Main.java && java Main`. Μη συγχέεις τα ονόματα αρχείων με αυτόματη εγκατάσταση. Δούλεψε σε δοκιμαστικό φάκελο.


## Java — Διαδρομή ουσιαστικής εξάσκησης

### Στόχος και σχεδιασμός
Υλοποίησε αποθήκη όπου κάθε SKU υπάρχει μία φορά, το απόθεμα δεν γίνεται αρνητικό και μια αποτυχημένη πράξη δεν αλλάζει κατάσταση. Το `Map<String,Integer>` προσφέρει συνήθως γρήγορη αναζήτηση, αλλά το `put` αντικαθιστά υπάρχον κλειδί αν δεν ελεγχθεί. Διαχώρισε τη λογική αποθέματος από αρχεία και κονσόλα.

### Εκτελέσιμο παράδειγμα (Java 17+)
Αποθήκευσε ως `InventoryLab.java` και εκτέλεσε `javac --release 17 InventoryLab.java`, μετά `java InventoryLab`.

~~~java
import java.util.HashMap;
import java.util.Map;

public class InventoryLab {
    private final Map<String, Integer> stock = new HashMap<>();

    void add(String sku, int quantity) {
        if (sku == null || !sku.matches("[A-Z0-9-]{2,20}"))
            throw new IllegalArgumentException("invalid SKU");
        if (quantity < 0) throw new IllegalArgumentException("negative quantity");
        if (stock.containsKey(sku)) throw new IllegalStateException("duplicate SKU");
        stock.put(sku, quantity);
    }

    void sell(String sku, int amount) {
        if (amount <= 0) throw new IllegalArgumentException("invalid sale");
        Integer available = stock.get(sku);
        if (available == null) throw new IllegalArgumentException("unknown SKU");
        if (amount > available) throw new IllegalStateException("insufficient stock");
        stock.put(sku, available - amount);
    }

    public static void main(String[] args) {
        InventoryLab lab = new InventoryLab();
        lab.add("SKU-01", 5);
        lab.sell("SKU-01", 2);
        if (lab.stock.get("SKU-01") != 3) throw new AssertionError();
        try {
            lab.sell("SKU-01", 99);
            throw new AssertionError("should reject sale");
        } catch (IllegalStateException expected) {
            if (lab.stock.get("SKU-01") != 3) throw new AssertionError("mutation");
        }
        System.out.println("PASS");
    }
}
~~~

### Διερεύνηση ορίων
Δοκίμασε δεύτερη εισαγωγή ίδιου SKU, κενό κωδικό, αρνητική ποσότητα, άγνωστο SKU και πώληση μηδέν. Έλεγξε τύπο exception και ότι ο χάρτης έμεινε ίδιος. Στη `restock`, η πρόσθεση κοντά στο `Integer.MAX_VALUE` μπορεί να υπερχειλίσει: χρησιμοποίησε `Math.addExact` πριν από τη μεταβολή του χάρτη.

### Αποθήκευση
Πρόσθεσε interface `Store` με `load` και `save` και UTF-8 CSV με `Files.newBufferedReader`. Το απλό `split(",")` δεν υποστηρίζει σωστά quoted CSV. Χρησιμοποίησε βιβλιοθήκη ή καθόρισε περιορισμένη μορφή. Γράψε πρώτα σε προσωρινό αρχείο και κάνε μετακίνηση μετά την επικύρωση. Σκέψου διακοπή κατά την αποθήκευση.

### Απόδειξη γνώσης
Έλεγξε καθαρή εκκίνηση, διπλό SKU, άκυρα δεδομένα, επαναφόρτωση, κομμένο αρχείο και μηδενικό απόθεμα. Κράτησε έκδοση Java, output compiler και πραγματικό test transcript. Επανέλαβε σε καθαρό φάκελο. Η ορθότητα μονονηματικού Map δεν αποδεικνύει ασφάλεια με ταυτόχρονες αλλαγές.

## Java — Τεχνικά σημεία και συχνές παγίδες

### Τεχνική γνώση

1. Οι checked exceptions δηλώνονται ή αντιμετωπίζονται σύμφωνα με τους κανόνες της Java.
2. Το try-with-resources κλείνει αντικείμενα AutoCloseable.
3. Τα generics χρησιμοποιούν κυρίως type erasure κατά την εκτέλεση.
