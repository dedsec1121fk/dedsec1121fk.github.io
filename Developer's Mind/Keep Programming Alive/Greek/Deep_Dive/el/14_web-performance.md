# Απόδοση browser και όρια εικόνων

## Τι συμβαίνει
Στα κινητά, μεγάλα SVG backgrounds και συνεχόμενα φίλτρα αυξάνουν rendering κόστος ακόμη κι όταν το HTML είναι static.

## Πρακτικός έλεγχος
Προτίμησε μία αργή animation μόνο με transform αντί για πολλά ανεξάρτητα κινούμενα στοιχεία. Σεβάσου reduced motion και δοκίμασε σε μεσαίο κινητό.

## Συνήθεις παγίδες
Μέτρησε πριν βελτιστοποιήσεις: performance flame chart, βάρος σελίδας, long tasks και layout shifts. Απόφυγε τυφλό minification που δυσκολεύει τη συντήρηση.

## Μικρό παράδειγμα για προσαρμογή
```text
performance.getEntriesByType('resource').length
```

## Σύγκρινε με ίδιο workload
Μέτρησε χωριστά first load και warm-cache load στο ίδιο viewport. Κράτησε transferred bytes, image decoding, long tasks και scrolling responsiveness. Το resource count δεν εκτιμά κόστος: μία μεγάλη εικόνα μπορεί να κυριαρχεί απέναντι σε πολλά μικρά requests. Δύο performance.now timestamps μετρούν elapsed time, όχι πλήρη ανάλυση rendering.

Για galaxy background σύγκρινε στατική εικόνα και ενεργό animation κρατώντας ίδιο artwork/viewport. Μεγάλες blurred/filter επιφάνειες μπορεί να δημιουργούν ακριβά intermediate layers. Ακόμη και transform-only κίνηση κοστίζει όταν το layer είναι τεράστιο, επομένως δεν αποτελεί καθολική εγγύηση ταχύτητας.

Με prefers-reduced-motion σταμάτησε διακοσμητική κίνηση διατηρώντας κείμενο και controls. Δέσμευσε image dimensions για λιγότερα layout shifts και βεβαιώσου ότι optional imagery δεν καθυστερεί navigation. Το desktop trace βοηθά να εντοπίσεις δουλειά, αλλά η αλλαγή πρέπει να επαληθευθεί στο στοχευμένο κινητό πριν χαρακτηριστεί mobile performance βελτίωση.
