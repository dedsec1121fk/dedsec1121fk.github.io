# solidity — συγκεντρωτικός οδηγός

## Solidity

Η Solidity μεταγλωττίζει συμβόλαια για Ethereum Virtual Machine. Κλήση που αλλάζει κατάσταση απαιτεί transaction, όχι απλή τοπική εκτέλεση. Για μάθηση χρησιμοποίησε μόνο τοπικό EVM ή δοκιμαστικό περιβάλλον· πραγματικές συναλλαγές μπορεί να κοστίζουν.

### Συμβόλαιο Counter

Αποθήκευσε Counter.sol:

~~~solidity
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

contract Counter {
    uint256 public count;
    event Incremented(uint256 value);

    function increment() external {
        count += 1;
        emit Incremented(count);
    }
}
~~~

Κάνε compile με συμβατό solc ή τοπικό Solidity tool. Κάνε deploy σε προσωρινό local chain. Ο δημόσιος getter count() αρχικά επιστρέφει 0. Μετά από δύο increment() transactions επιστρέφει 2 και εκπέμπονται δύο Incremented events.

### Διαφορά της κατάστασης

Το count αποθηκεύεται στο storage του contract. Μόνο επιβεβαιωμένη συναλλαγή αλλάζει το state· το read-only count() δεν το μεταβάλλει. Από Solidity 0.8 η αριθμητική ελέγχει overflow εξ ορισμού. Τα events βοηθούν στο indexing αλλά δεν αντικαθιστούν το storage.

### Σφάλματα και ασφάλεια

Οποιοσδήποτε μπορεί να καλέσει increment(): αυτό είναι σκόπιμο στην άσκηση, όχι σύστημα δικαιωμάτων. Για owner-only λειτουργία χρειάζεται ρητό authorization και tests. Μη χρησιμοποιείς μη ελεγμένα financial contracts με πραγματικά κεφάλαια.

### Άσκηση

Πρόσθεσε decrement που απορρίπτει μηδέν και έλεγξε το revert. Σύγκρινε επιτυχημένο receipt με αποτυχημένη συναλλαγή. Κατέγραψε έκδοση compiler και local chain.

Τεκμηρίωση: https://docs.soliditylang.org/

## Solidity — Αναλυτικός οδηγός εξάσκησης

### Ξεκίνησε από αληθινή σύνταξη
Το αρχικό παράδειγμα της Solidity είναι η μικρότερη αφετηρία. Διάβασε τη σειρά των πράξεων και τον τρόπο εμφάνισης, έπειτα επιβεβαίωσέ το στο σωστό περιβάλλον. Μην θεωρείς ότι η σύνταξη άλλης γλώσσας έχει ίδια σημασία.

~~~text
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
contract Greeting {
    string public message = "Hello, Ada!";
}
~~~

**Περιβάλλον εκτέλεσης:** Compile with solc or a local Solidity test framework.. Έλεγξε έκδοση compiler/interpreter πριν τροποποιήσεις τον κώδικα και κράτησε την αρχική έξοδο. Δούλεψε σε προσωρινό κατάλογο, μακριά από πραγματικά δεδομένα.

### Οδηγούμενο εργαστήριο
Πρόσθεσε counter στο greeting contract που μπορεί να αλλάξει μόνο ο deployer. Δοκίμασε δεύτερο caller που πρέπει να κάνει revert και σύγκρινε view με transaction και gas.

### Δοκιμές ορίων
Η μεταγλώττιση δεν είναι audit: έλεγξε sender, reentrancy και invariants σε τοπική EVM χωρίς πραγματικά χρήματα.

### Προχωρημένη αποστολή
Φτιάξε ξεχωριστό αρχείο για το παραπάνω εργαστήριο και πειραματίσου με μία αλλαγή σε σειρά, σχήμα, τύπο, scope ή περιβάλλον, ανάλογα με τη Solidity. Καθόρισε invariant και σύγκρινε αναμενόμενη με πραγματική έξοδο. Αν κάτι διαφέρει, απομόνωσε το ελάχιστο παράδειγμα πριν μεγαλώσεις το πρόγραμμα.

## Solidity — Διαδρομή ουσιαστικής εξάσκησης

### Ανεξάρτητο τεχνικό εργαστήριο
Κάνε deploy Counter σε isolated EVM και έλεγξε ότι owner είναι deployer. Ο owner κάνει increment, άλλος caller πρέπει να κάνει revert χωρίς storage change. Σύγκρινε gas mutation με view. Πρόσθεσε external call μόνο αφού εξετάσεις failure cases και reentrancy. Tests δεν αποτελούν financial audit.

## Solidity — Τεχνικά σημεία και συχνές παγίδες

### Τεχνική γνώση

1. Οι αλλαγές κατάστασης συμβολαίων έχουν κόστος και μπορεί να μην αντιστρέφονται.
2. Η εξουσιοδότηση απαιτεί έλεγχο μέσα στο smart contract.
3. Πρόσεξε checks-effects-interactions και reentrancy στις εξωτερικές κλήσεις.
