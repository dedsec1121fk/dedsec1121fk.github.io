# Το managed binary χρειάζεται κατανόηση metadata και runtime

## Ξεκίνα από assembly που δημιούργησες
Τα .NET assemblies περιέχουν συχνά CLI metadata για τύπους, methods και references. Η στατική επιθεώρηση αποκαλύπτει δηλωμένες εξαρτήσεις χωρίς να εκτελέσεις τον κώδικα. Ωστόσο reflection και δυναμική φόρτωση μπορούν να προσθέτουν συμπεριφορά που δεν φαίνεται από απλή λίστα. Μην υποθέτεις ότι ένα μόνο DLL περιέχει όλο τον κώδικα της εφαρμογής.

~~~sh
# Σε σύστημα με .NET SDK:
dotnet --info
# Διαγνωστικά χωρίς εκτέλεση του target:
file Sample.dll
sha256sum Sample.dll
~~~

## Εξέτασε πρώτα τις αναφορές
Με κατάλληλο metadata browser κατέγραψε assembly identity, target framework, references και public types. Ξεχώρισε λογικό όνομα method από IL instructions. Ένα reference που δεν μπορεί να φορτωθεί προκαλεί runtime πρόβλημα ακόμη κι αν το DLL είναι σωστό ως αρχείο.

## Ελεγχόμενο πείραμα
Δημιούργησε δική σου class library με δημόσια συνάρτηση που επιστρέφει σταθερό string και console app που τη χρησιμοποιεί. Μετά το build μετονόμασε προσωρινά το referenced DLL μέσα σε disposable output directory και κατάγραψε το loader error. Επανέφερε το αρχείο και έλεγξε την αναμενόμενη έξοδο. Κράτησε build settings για αναπαραγωγή.

## Όρια και αποδείξεις
Μην ανεβάζεις ιδιόκτητα assemblies σε εξωτερικούς decompilers χωρίς άδεια. Ο decompiler δίνει προσέγγιση υψηλότερου επιπέδου, όχι απαραίτητα τα ακριβή αρχικά source/comments. Σημείωσε εργαλείο, μέθοδο, hash και ποια συμπεράσματα είναι εκτιμήσεις.
