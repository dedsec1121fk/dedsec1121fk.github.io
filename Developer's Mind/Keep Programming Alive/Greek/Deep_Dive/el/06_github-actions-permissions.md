# GitHub Actions tokens και ελάχιστα δικαιώματα

## Τι συμβαίνει
Ένα workflow τρέχει με δικαιώματα που εξαρτώνται από το συμβάν και τις ρυθμίσεις. Βάλε contents:read για tests και contents:write μόνο όταν χρειάζεται commit.

## Πρακτικός έλεγχος
Καρφίτσωσε έμπιστα actions σε εκδόσεις, μη γράφεις secrets στα logs και έλεγξε scripts από pull requests πριν δώσεις credentials.

## Συνήθεις παγίδες
Για προγραμματισμένα jobs εξέτασε concurrency, όρια χρόνου και idempotency. Κάνε commit μόνο αν άλλαξαν τα παραγόμενα δεδομένα, όχι άσκοπο build όλης της σελίδας.

## Μικρό παράδειγμα για προσαρμογή
```text
permissions:
  contents: read
```

## Ακολούθησε το trust του event και του checked-out κώδικα
~~~yaml
permissions:
  contents: read
jobs:
  checks:
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - run: printf '%s\n' 'No write token needed for this check'
~~~
Το ενδεικτικό job δεν κάνει checkout ούτε εκτελεί repository code. Ένα πραγματικό test job χρειάζεται έλεγχο και στο checkout/dependencies. Όπου το απαιτεί η supply-chain πολιτική, κάνε pin action σε reviewed immutable commit SHA· το version tag μπορεί να μετακινηθεί. Το contents permission δεν παρέχει από μόνο του Pages deployment ή OIDC.

Μην συνδυάζεις elevated pull_request_target context με checkout και εκτέλεση μη έμπιστης συνεισφοράς. Event και checkout revision καθορίζουν μαζί το trust boundary. Το secret masking δεν αποτρέπει κάθε διαδρομή exfiltration από untrusted code. Κράτησε write/deployment άδειες μόνο στο job που τις χρειάζεται και τα untrusted tests read-only.

Πηγή: [GitHub event trust guidance](https://docs.github.com/en/actions/reference/security/securely-using-pull_request_target).
