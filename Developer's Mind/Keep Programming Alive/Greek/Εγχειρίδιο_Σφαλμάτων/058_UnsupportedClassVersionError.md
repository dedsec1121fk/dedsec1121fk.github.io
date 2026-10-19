# UnsupportedClassVersionError — ασυμβατότητα bytecode και μηχανής Java

## Τι σημαίνει η αποτυχία
Κάθε αρχείο Java .class αρχίζει με την υπογραφή CAFEBABE και περιλαμβάνει έκδοση minor και major. Όταν παλαιότερη JVM προσπαθεί να φορτώσει bytecode για νεότερη Java, μπορεί να εμφανιστεί UnsupportedClassVersionError. Η major 61 αντιστοιχεί στη Java 17 και η major 65 στη Java 21. Η επιτυχημένη μεταγλώττιση δεν εγγυάται ότι η JVM της εγκατάστασης υποστηρίζει τον παραγόμενο κώδικα.

## Ελεγχόμενη λύση
Το μικρό πρόγραμμα εξετάζει τεχνητές ακολουθίες byte χωρίς να εκτελεί μη έμπιστα αρχεία .class. Ελέγχει την υπογραφή και τον αριθμό major, μαζί με σκόπιμα λανθασμένη υπογραφή. Δεν είναι πλήρης αναλυτής ή έλεγχος ασφαλείας αρχείων Java, αλλά εξηγεί από πού προκύπτει η αναφορά ασυμβατότητας.

## Παράδειγμα κώδικα
Αποθήκευσε ως ClassVersionLab.java.

~~~java
import java.io.ByteArrayInputStream;
import java.io.DataInputStream;
import java.io.IOException;
public class ClassVersionLab {
    static int major(byte[] bytes) throws IOException {
        try (DataInputStream input = new DataInputStream(new ByteArrayInputStream(bytes))) {
            if (input.readInt() != 0xCAFEBABE) throw new IOException("not a class file");
            input.readUnsignedShort(); // minor class-file version
            return input.readUnsignedShort();
        }
    }
    public static void main(String[] args) throws Exception {
        byte[] java17 = {(byte) 0xCA, (byte) 0xFE, (byte) 0xBA, (byte) 0xBE, 0, 0, 0, 61};
        byte[] java21 = {(byte) 0xCA, (byte) 0xFE, (byte) 0xBA, (byte) 0xBE, 0, 0, 0, 65};
        if (major(java17) != 61 || major(java21) != 65) throw new AssertionError();
        try {
            major(new byte[]{0, 0, 0, 0, 0, 0, 0, 65});
            throw new AssertionError("invalid class accepted");
        } catch (IOException expected) {
            if (!expected.getMessage().contains("class file")) throw new AssertionError();
        }
        System.out.println("PASS: Java 17/21 class versions and invalid magic");
    }
}
~~~

## Γιατί λειτουργεί
Εκτέλεσε javac ClassVersionLab.java && java ClassVersionLab με συμβατό JDK, δοκιμασμένο σε Java 21. Για πραγματικό jar, έλεγξε την έκδοση χωρίς να εκτελέσεις άγνωστο κώδικα: javap -verbose -classpath app.jar fully.qualified.ClassName. Το όνομα ή η επέκταση jar δεν δηλώνει τη συμβατότητα.

## Ασφαλής επαλήθευση
Για εφαρμογή που πρέπει να τρέχει σε Java 17, χρησιμοποίησε javac --release 17 Source.java όπου υποστηρίζεται. Η --release περιορίζει τόσο τον στόχο του bytecode όσο και τα διαθέσιμα API. Οι επιλογές -source και -target από μόνες τους μπορεί να αφήσουν κλήσεις σε βιβλιοθήκες νεότερης έκδοσης. Έλεγξε ξεχωριστά και τα εξαρτώμενα jar. Η πραγματική έκδοση είναι αυτή της JVM στην οποία τρέχει η εφαρμογή, όχι απαραίτητα του υπολογιστή ανάπτυξης.

## Άσκηση και αποδεικτικά
Κατάγραψε έκδοση compiler, πραγματικής JVM, αριθμό major της αποτυχημένης κλάσης και ελάχιστη απαιτούμενη έκδοση. Μην αλλάζεις απλώς τα byte της κεφαλίδας για να παρακάμψεις τον έλεγχο: ούτε νέες εντολές bytecode ούτε νεότερα API μετατρέπονται αυτόματα για παλιές JVM. Αν χρειάζεται, επαναμεταγλώττισε με συμβατό κώδικα και εξαρτήσεις.

**Πρωτογενής τεκμηρίωση:** https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-4.html
