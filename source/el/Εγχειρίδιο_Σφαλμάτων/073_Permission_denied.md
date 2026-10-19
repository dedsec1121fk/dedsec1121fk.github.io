# Permission denied: εντοπισμός δικαιώματος

## Αναγνώριση της πραγματικής αποτυχίας
Το Permission denied μπορεί να συμβεί σε file open, directory traversal, μη εκτελέσιμο script ή Android shared storage. Τα read/write bits διαφέρουν από το directory execute/traverse. Το chmod 777 δεν διορθώνει σωστά κάθε πρόβλημα.

## Ασφαλής αρχικός έλεγχος
~~~sh
id
pwd
ls -ld -- .
ls -l -- target.sh
# Inspect before any chmod/chown.
~~~

## Διόρθωση αιτίας χωρίς παράκαμψη προειδοποίησης
Προτίμησε bash target.sh σε κατάλληλο readable script ή πρόσθεσε execute permission μόνο σε δικό σου αρχείο αφού το εξετάσεις. Σε Termux έλεγξε Android permissions και termux-setup-storage, αλλά scoped storage ισχύει ακόμη. Σε Windows χρησιμοποίησε Get-Acl για ACL errors.

**Τεκμηρίωση:** https://man7.org/linux/man-pages/man2/access.2.html

## Εντόπισε ποιο δικαίωμα λείπει
Το `Permission denied` δεν σημαίνει πάντα «χρειάζεται chmod». Μπορεί να αφορά την ανάγνωση αρχείου, την εγγραφή σε προστατευμένο φάκελο, την εκτέλεση script, την πρόσβαση σε γονικό κατάλογο ή περιορισμό του filesystem. Ξεκίνα με:
~~~sh
id
ls -ld . ./example.sh
stat ./example.sh
~~~
Για την απευθείας εκτέλεση ενός κανονικού αρχείου χρειάζεται δικαίωμα `x`, αλλά και δυνατότητα προσπέλασης των γονικών φακέλων. Αντίθετα το `sh ./example.sh` διαβάζει τον κώδικα με τον interpreter και ενδέχεται να λειτουργεί χωρίς executable bit στο αρχείο.

## Πείραμα μόνο σε προσωρινό φάκελο
Δημιούργησε ένα δικό σου `example.sh` με `#!/bin/sh` και `printf 'ok\n'`. Σύγκρινε `./example.sh` με `sh ./example.sh`. Έπειτα, μόνο στο αρχείο της δοκιμής, βάλε δικαίωμα εκτέλεσης για τον χρήστη και επανέλαβε. Αν ακόμα αποτύχει, έλεγξε το mount ή το μονοπάτι του interpreter. Αν το σφάλμα αφορά εγγραφή logs, το executable bit δεν έχει σχέση· ψάξε αν ο φάκελος προορισμού επιτρέπει εγγραφή.

## Android/Termux και σωστή διόρθωση
Τα κοινόχρηστα αρχεία Android storage δεν συμπεριφέρονται σαν κανονικός Linux home directory: η απευθείας εκτέλεση μπορεί να απαγορεύεται από το mount. Δοκίμασε το αρχείο σε κατάλληλο ιδιωτικό κατάλογο του Termux αντί να αλλάξεις αδιακρίτως permissions. Απέφυγε `chmod -R 777`, `sudo` ή μαζικό `chown` για ένα script: κρύβουν την πραγματική αιτία και μπορεί να εκθέσουν δεδομένα.
