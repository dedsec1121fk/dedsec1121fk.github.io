# Η στατική επιθεώρηση APK δεν απαιτεί εγκατάσταση

## Αντιμετώπισε το πακέτο ως μη έμπιστη είσοδο
Πολλά μέρη ενός APK διαβάζονται σαν ZIP, όμως το signing block και οι Android resources χρειάζονται ειδικά εργαλεία. Ξεκίνα από εφαρμογή που έχεις δημιουργήσει ή που έχεις άδεια να αναλύσεις. Κράτησε SHA-256 και απαρίθμησε τα paths πριν την εξαγωγή. Το AndroidManifest μπορεί να χρησιμοποιεί binary XML, επομένως η απλή ανάγνωση ως κείμενο δεν είναι αξιόπιστη.

~~~sh
sha256sum sample.apk
unzip -l sample.apk | head -45
unzip -t sample.apk
# Εφόσον υπάρχουν Android SDK build-tools:
apksigner verify --verbose sample.apk
~~~

## Τι αποδεικνύει κάθε έλεγχος
Το `unzip -t` ελέγχει τη δομή των συμπιεσμένων μελών, όχι την εγκυρότητα της Android υπογραφής. Το `apksigner verify` εξετάζει τις υποστηριζόμενες signature schemes όταν είναι διαθέσιμο, όχι αν το app είναι ασφαλές. Το manifest δηλώνει permissions και components, αλλά δεν αποδεικνύει ότι όλες οι δυνατότητες χρησιμοποιήθηκαν. Τα assets δείχνουν ονόματα αρχείων, όχι κατ' ανάγκη πραγματική ροή εκτέλεσης.

## Δικό σου εργαστήριο
Δημιούργησε μικρή Android εφαρμογή και σύγκρινε debug και release package. Κατάγραψε min/target SDK, package name, fingerprint πιστοποιητικού και εμφανιζόμενα permissions. Μην δημοσιεύεις private signing key και μην υποθέτεις ότι σωστή υπογραφή αποδεικνύει καλοπροαίρετο λογισμικό.

## Όριο νόμιμης έρευνας
Μη τροποποιείς ξένα APK για παράκαμψη πληρωμών, authentication ή access controls. Σε εξουσιοδοτημένο audit μπορείς να αναφέρεις προβληματικό exported component ή ευαίσθητο αρχείο στον ιδιοκτήτη, με επαλήθευση σε ελεγχόμενο περιβάλλον.

Πηγή: https://source.android.com/docs/security/features/apksigning
