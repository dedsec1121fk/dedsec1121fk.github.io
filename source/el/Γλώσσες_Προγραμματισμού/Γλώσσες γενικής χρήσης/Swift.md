# swift — συγκεντρωτικός οδηγός

## Swift

### Μοντέλο λειτουργίας
Η Swift χρησιμοποιεί optionals, value types και protocols, σε Apple πλατφόρμες και άλλους διαθέσιμους στόχους.

### Παράδειγμα
```text
let values = [1, 2, 3]
print(values.reduce(0, +))
```

### Δοκίμασέ το με νόημα
Σύγκρινε reduce με κενό array και εξασκήσου σε ασφαλές unwrap optional.

### Σφάλμα που πρέπει να ξεχωρίσεις
Η διαθεσιμότητα Swift compiler δεν συνεπάγεται παρουσία UIKit/SwiftUI εκτός Apple.

Για να κρίνεις την άσκηση, κατέγραψε την αρχική είσοδο, την πρόβλεψη και την παρατήρηση σε πραγματικό, συμβατό περιβάλλον Swift. Δώσε ξεχωριστό παράδειγμα όπου αλλάζει μόνο μία μεταβλητή ή ένα όρισμα. Αν εργάζεσαι χωρίς την αναγκαία εφαρμογή, μελέτησε τη σύνταξη ως παράδειγμα και μην παρουσιάζεις το κείμενο ως εκτελεσμένο test.

## Swift — Αναλυτικός οδηγός εξάσκησης

### Πρόβλημα
Το κείμενο από φόρμα δεν είναι αυτομάτως ακέραιος. Ο initializer Int επιστρέφει Optional όταν η μετατροπή δεν πετυχαίνει. Το guard επιτρέπει έγκαιρη έξοδο και ασφαλή χρήση της αποδεσμευμένης τιμής.

### Εκτέλεση
Αποθήκευσε main.swift και τρέξε swiftc main.swift -o parser && ./parser όπου υπάρχει Swift compiler. Περιμένεις Swift parser OK. Το Foundation προσφέρει trimmingCharacters. Η Swift δεν είναι προεγκατεστημένη σε όλα τα συστήματα.

~~~swift
import Foundation
func parseLimit(_ raw: String) -> Int? {
    guard let value = Int(raw.trimmingCharacters(in: .whitespacesAndNewlines)),
          (1...100).contains(value) else {
        return nil
    }
    return value
}
if parseLimit(" 10 ") != 10 || parseLimit("101") != nil ||
   parseLimit("word") != nil {
    fatalError("validation regression")
}
print("Swift parser OK")
~~~

### Τι κάνει το guard
Η Int επιστρέφει nil για μη ακέραιο ή τιμή εκτός επιτρεπτού εύρους τύπου. Η συνθήκη 1...100 είναι κανόνας της εφαρμογής. Η επιστροφή nil αποφεύγει το force unwrap. Έπειτα το value είναι κανονικό Int χωρίς Optional.

### Επέκταση
Δοκίμασε κενό κείμενο, πρόσημο +, αρνητικές τιμές, Unicode κενά, 0010, 1.5 και μεγάλο αριθμό. Φτιάξε throwing συνάρτηση που διακρίνει Missing, InvalidNumber και OutsideRange. Εξήγησε πότε αρκεί Optional και πότε απαιτούνται λεπτομερή errors.

### Διάγνωση και πλατφόρμες
Crash λόγω value! συχνά σημαίνει ότι αποδεσμεύτηκε nil. Προτίμησε guard ή if let. Σε εφαρμογές Apple διαχώρισε Foundation από SwiftUI και UIKit: το συγκεκριμένο εργαστήριο είναι ανεξάρτητο από γραφικό περιβάλλον.
Επιτυχία: τρεις έλεγχοι χωρίς force unwrap. https://docs.swift.org/swift-book/documentation/the-swift-programming-language/thebasics/

## Swift — Παραδείγματα πραγματικού κώδικα

### Εκτέλεση των παραδειγμάτων

Τα παραδείγματα είναι μικρά και αυτοτελή. Χρησιμοποίησε τη σχετική εγκατεστημένη γλώσσα. Ενδεικτικά: `swift {file}`. Μη συγχέεις τα ονόματα αρχείων με αυτόματη εγκατάσταση. Δούλεψε σε δοκιμαστικό φάκελο.


## Swift — Διαδρομή ουσιαστικής εξάσκησης

### Κριτήρια επιτυχίας
Διάβασε μία μικρή λίστα JSON, απόρριψε διπλούς αναγνωριστικούς αριθμούς και κενούς τίτλους, επαλήθευσε ότι η μεταβολή ενός αντιγράφου δομής δεν αλλάζει το αρχικό και έλεγξε την επανακωδικοποίηση. Η απουσία υποχρεωτικού πεδίου δεν ισοδυναμεί με κενή επιτρεπτή τιμή. Η άσκηση λειτουργεί σε τερματικό με Foundation, χωρίς SwiftUI ή δικτυακή αποθήκευση.

### Εκτελέσιμο εργαστήριο
Αποθήκευσε ως ChecklistLab.swift και εκτέλεσε swift ChecklistLab.swift όπου υπάρχει Swift με Foundation. Ο κώδικας ελέγχει μόνο τεχνητά δεδομένα στη μνήμη.

~~~swift
import Foundation

struct Task: Codable, Equatable {
    let id: Int
    var title: String
    var done: Bool
}

enum ListError: Error { case duplicateId, emptyTitle }

func validate(_ tasks: [Task]) throws {
    guard Set(tasks.map(\.id)).count == tasks.count else { throw ListError.duplicateId }
    guard tasks.allSatisfy({ !$0.title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty })
        else { throw ListError.emptyTitle }
}

let input = """
[{"id":1,"title":"Inspect logs","done":false}]
""".data(using: .utf8)!
let original = try JSONDecoder().decode([Task].self, from: input)
try validate(original)
var copy = original
copy[0].done = true
precondition(original[0].done == false) // struct value semantics
precondition(copy[0].done == true)
precondition((try? validate(original + original)) == nil)
precondition((try? JSONDecoder().decode([Task].self,
    from: Data("[{\"id\":2}]".utf8))) == nil)
precondition((try? validate([Task(id: 3, title: "   ", done: false)])) == nil)
let roundtrip = try JSONDecoder().decode([Task].self,
    from: JSONEncoder().encode(copy))
precondition(roundtrip == copy)
print("PASS: Codable, copy semantics, duplicate IDs, invalid input")
~~~

### Τι χρειάζεται να καταλάβεις
Η Task είναι struct, επομένως η μεταβολή του copy[0] δεν επηρεάζει το original. Ο JSONDecoder ελέγχει τύπους και υποχρεωτικά πεδία, όχι όμως επιχειρησιακούς κανόνες όπως μοναδικότητα κωδικών ή μη κενούς τίτλους: αυτοί ανήκουν στη validate. Ο έλεγχος Equatable βεβαιώνει ότι η κωδικοποίηση και η αποκωδικοποίηση διατηρούν τα στοιχεία του μοντέλου. Η εξαναγκασμένη αποσυσκευασία σε ανεξέλεγκτη είσοδο θα μπορούσε να προκαλέσει κατάρρευση· εδώ περιορίζεται σε γνωστό δοκιμαστικό δείγμα.

### Ασκήσεις και αντιμετώπιση σφαλμάτων
1. Αφαίρεσε το done από το JSON και κατάγραψε το DecodingError.keyNotFound. Σύγκρινε με προαιρετικό πεδίο και αιτιολόγησε αν επιτρέπεται άγνωστη κατάσταση ολοκλήρωσης.
2. Πρόσθεσε δεύτερη εργασία με id 1 και βεβαίωσε την απόρριψη. Δοκίμασε τίτλο μόνο με κενά και τίτλο με ελληνικά γράμματα: μόνο ο πρώτος πρέπει να απορριφθεί.
3. Αντικατάστησε προσωρινά τη struct με class. Παρατήρησε τι συμβαίνει όταν αλλάζει το copy[0].done, εξήγησε τον κοινό δείκτη αναφοράς και επανέφερε τη struct.
4. Σε μεταγενέστερη αποθήκευση δοκίμασε σκόπιμα μη έγκυρη διαδρομή. Μετάδωσε την αποτυχία εγγραφής· μην εμφανίζεις επιτυχία πριν ολοκληρωθεί η αποθήκευση.

**Αποδείξεις μάθησης:** μήνυμα PASS, ένα καταγεγραμμένο σφάλμα αποκωδικοποίησης, έλεγχος διπλού ID, σύγκριση αντιγράφου και αναφοράς και εξήγηση γιατί το Codable δεν αντικαθιστά την επικύρωση κανόνων.

## Swift — Τεχνικά σημεία και συχνές παγίδες

### Τεχνική γνώση

1. Τα Optionals δηλώνουν απουσία τιμής και χρειάζονται ασφαλή αποσυσκευασία.
2. Τα structs έχουν σημασιολογία τιμής, ενώ οι classes σημασιολογία αναφοράς.
3. Το defer βοηθά στον καθαρισμό πριν την έξοδο από μια εμβέλεια.
