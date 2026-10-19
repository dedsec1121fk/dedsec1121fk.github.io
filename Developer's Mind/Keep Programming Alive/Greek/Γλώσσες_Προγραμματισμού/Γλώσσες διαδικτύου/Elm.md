# elm — συγκεντρωτικός οδηγός

## Elm

### Η ουσία του λειτουργικού προγραμματισμού

Η Elm χρησιμοποιείται για διεπαφές browser και βασίζεται σε συναρτήσεις που μετασχηματίζουν τιμές χωρίς να μεταβάλλουν κοινή κατάσταση. Οι παρενέργειες του browser διαχειρίζονται ξεχωριστά. Πριν δημιουργήσεις εφαρμογή με Model/Msg/update, εξέτασε τι μπορεί να χαθεί σε έναν απλό μετασχηματισμό.

Σε προσωρινό έργο που δημιουργήθηκε με elm init, αποθήκευσε το src/Main.elm:

~~~elm
module Main exposing (main)

import Html exposing (text)

main =
    let
        raw =
            [ "3", "oops", "4" ]

        valid =
            List.filterMap String.toInt raw
    in
    text (String.fromInt (List.sum valid))
~~~

Μεταγλώττισε με elm make src/Main.elm --output=main.js. Φόρτωσε το παραγόμενο script σε προσωρινό HTML και αρχικοποίησε την Elm.Main.init σε υπάρχοντα κόμβο DOM. Αναμένεται να εμφανιστεί 7. Για την πρώτη μεταγλώττιση ίσως χρειάζεται δίκτυο ή διαθέσιμη προσωρινή μνήμη πακέτων.

### Το σφάλμα που δεν φαίνεται στην έξοδο

Η String.toInt επιστρέφει Maybe Int: Just n όταν η μετατροπή πετυχαίνει και Nothing όταν αποτυγχάνει. Η List.filterMap κρατά τις έγκυρες τιμές και απορρίπτει σιωπηλά τις Nothing. Έτσι η είσοδος ["oops"] εμφανίζει 0, παρότι δεν υπήρχε έγκυρος αριθμός. Αυτό δεν αρκεί για διαδικασία εισαγωγής όπου πρέπει να ελεγχθεί κάθε εγγραφή.

Σύγκρινε ["3", "4"] → 7, ["3", "oops", "4"] → 7 με απώλεια μίας τιμής και ["oops"] → 0. Η ίδια αριθμητική έξοδος δεν αποδεικνύει ίδια ποιότητα εισόδου. Για αξιόπιστη επικύρωση επέστρεψε ρητό Result String (List Int) αντί να εξαφανίζεις τις προβληματικές εγγραφές.

### Διάγνωση και εξέλιξη

Αν λείπει το elm.json, δημιούργησε σωστά το έργο με elm init. Αν αποτύχει η λήψη πακέτων, κατάγραψε σφάλμα περιβάλλοντος, όχι δήθεν λάθος σύνταξης. Αν η σελίδα είναι κενή, έλεγξε κονσόλα browser, διαδρομή script και Elm.Main.init. Σε ασυμφωνία τύπων διαχώρισε το Maybe Int από το Int.

Άσκηση: υλοποίησε parseAll : List String -> Result String (List Int), ώστε οι δύο είσοδοι με "oops" να επιστρέφουν σαφές σφάλμα. Πρόσθεσε έπειτα Model, Msg και update για εμφάνιση του μηνύματος. Τεκμηρίωσε έκδοση Elm, μεταγλώττιση και πραγματική συμπεριφορά browser. Οι τιμές είναι προβλέψεις στατικής ανάλυσης· δεν ισχυριζόμαστε εκτέλεση μεταγλωττιστή ή browser κατά τη συγγραφή.

## Elm — Αναλυτικός οδηγός εξάσκησης

### Όριο εισόδου και ασφάλεια

Η Browser.sandbox μπορεί να χειριστεί φόρμα χωρίς διακομιστή. Κράτησε το αρχικό κείμενο ως String, μετέτρεψέ το μόνο κατά την επικύρωση και εμφάνισε το μήνυμα με Html.text, ώστε το κείμενο να μην ερμηνεύεται ως HTML. Η επικύρωση στον browser βοηθά τον χρήστη αλλά δεν αντικαθιστά τον έλεγχο στον διακομιστή πριν από αποθήκευση δεδομένων.

Σε προσωρινό έργο elm init, αποθήκευσε το src/Main.elm:

~~~elm
module Main exposing (main)

import Browser
import Html exposing (Html, div, input, label, text)
import Html.Attributes exposing (for, id, value)
import Html.Events exposing (onInput)

type alias Model =
    { raw : String }

type Msg
    = Changed String

init : Model
init =
    { raw = "" }

update : Msg -> Model -> Model
update msg model =
    case msg of
        Changed next ->
            { model | raw = next }

describe : String -> String
describe raw =
    case String.toInt raw of
        Just age ->
            if age >= 0 && age <= 120 then
                "Accepted: " ++ String.fromInt age
            else
                "Out of range"

        Nothing ->
            "Enter a whole number"

view : Model -> Html Msg
view model =
    div []
        [ label [ for "age" ] [ text "Age (0–120)" ]
        , input [ id "age", value model.raw, onInput Changed ] []
        , div [] [ text (describe model.raw) ]
        ]

main : Program () Model Msg
main =
    Browser.sandbox { init = init, update = update, view = view }
~~~

Μεταγλώττισε με elm make src/Main.elm --output=main.js και αρχικοποίησε την Elm.Main.init σε πραγματικό κόμβο DOM. Απαιτούνται μεταγλωττιστής και εξαρτήσεις Elm· το παρόν δεν ισχυρίζεται ότι έγινε εκτέλεση κατά τη συγγραφή.

### Περιπτώσεις δοκιμής

Αναμενόμενα: κενό πεδίο → Enter a whole number· 0 → Accepted: 0· 120 → Accepted: 120· -1 και 121 → Out of range· 12.5 και abc → Enter a whole number. Η String.toInt επιστρέφει Maybe Int και η Nothing καλύπτεται ρητά. Τα όρια 0 και 120 περιλαμβάνονται. Κείμενο όπως <img src=x> που εμφανίζεται μέσω Html.text δεν δημιουργεί στοιχείο εικόνας.

Έλεγξε με πληκτρολόγιο ότι η ετικέτα εστιάζει στο σωστό πεδίο μέσω του ζεύγους for/id. Για πραγματική προσβασιμότητα χρειάζεται επίσης κατάλληλη ανακοίνωση σφάλματος, π.χ. περιοχή aria-live ή συσχέτιση περιγραφής· η ορατότητα του μηνύματος από μόνη της δεν αρκεί.

### Διάγνωση και ασκήσεις

- Σε ασυμφωνία τύπων, θυμήσου ότι η onInput παράγει String, όχι Int.
- Αν η ετικέτα δεν εστιάζει στο πεδίο, σύγκρινε for="age" και id="age".
- Αν δεν αλλάζει το αποτέλεσμα, έλεγξε τη φόρτωση script και ότι η εφαρμογή αρχικοποιήθηκε μία φορά.
- Άσκηση Α: γράψε validateAge : String -> Result String Int με διαφορετικό σφάλμα για άκυρο κείμενο και εκτός ορίων τιμή.
- Άσκηση Β: πρόσθεσε Submit και εξήγησε γιατί ο διακομιστής πρέπει να επαναλάβει τον έλεγχο.
- Άσκηση Γ: δοκίμασε κείμενο με κενά, π.χ. " 12 ", και τεκμηρίωσε τη συμπεριφορά της String.toInt αντί να θεωρήσεις δεδομένη την αποκοπή κενών.

Για να ολοκληρωθεί η άσκηση, κατέγραψε έκδοση Elm, πηγαίο κώδικα, στοιχεία μεταγλώττισης/δοκιμής στον browser, τις επτά βασικές εισόδους, έναν έλεγχο προσβασιμότητας και μία ελεγχόμενη αστοχία. Δεν παρουσιάζονται μη εκτελεσμένα παραδείγματα ως επιτυχώς δοκιμασμένα.

## Elm — Διαδρομή ουσιαστικής εξάσκησης

### Διαχωρισμός ευθυνών στην αρχιτεκτονική Elm

Το Model περιγράφει την κατάσταση, το Msg τα συμβάντα, η update την επόμενη κατάσταση και η view την εμφάνιση. Η Browser.sandbox αρκεί για παράδειγμα χωρίς HTTP ή συνδρομές. Η Elm ενημερώνει το DOM από το Model· δεν το τροποποιούμε αυθαίρετα πίσω από τον μηχανισμό της.

Σε προσωρινό έργο που δημιούργησες με elm init, αποθήκευσε το ακόλουθο στο src/Main.elm. Για την πρώτη μεταγλώττιση ίσως χρειαστεί πρόσβαση στο μητρώο πακέτων Elm ή ήδη διαθέσιμη προσωρινή μνήμη πακέτων.

~~~elm
module Main exposing (main)

import Browser
import Html exposing (Html, button, div, text)
import Html.Events exposing (onClick)

type alias Model =
    { count : Int }

type Msg
    = Increment
    | Reset

init : Model
init =
    { count = 0 }

update : Msg -> Model -> Model
update msg model =
    case msg of
        Increment ->
            { model | count = model.count + 1 }

        Reset ->
            { model | count = 0 }

view : Model -> Html Msg
view model =
    div []
        [ button [ onClick Increment ] [ text "Add one" ]
        , button [ onClick Reset ] [ text "Reset" ]
        , text (String.fromInt model.count)
        ]

main : Program () Model Msg
main =
    Browser.sandbox { init = init, update = update, view = view }
~~~

Μεταγλώττισε με elm make src/Main.elm --output=main.js. Σε προσωρινό HTML φόρτωσε το main.js και κάλεσε Elm.Main.init({ node: document.getElementById("app") }) σε κενό div με id app. Μην επεμβαίνεις έπειτα απευθείας στο περιεχόμενο του κόμβου που διαχειρίζεται η Elm.

### Πρόβλεψη και έλεγχος

Αρχική τιμή: 0. Δύο πατήματα στο Add one πρέπει να εμφανίσουν 2. Το Reset επαναφέρει το 0, ακόμη κι αν πατηθεί πρώτο. Η update επιστρέφει νέο Model χωρίς να μεταβάλλει το αρχικό record. Η διαχείριση συμβάντων και DOM γίνεται από το runtime.

Αν γράψεις { model | count = "one" }, ο μεταγλωττιστής αναμένεται να απορρίψει την τιμή String σε πεδίο Int. Πρόκειται για σφάλμα τύπου κατά τη μεταγλώττιση, όχι για εξαίρεση του browser. Η Browser.sandbox δεν εκδίδει Cmd Msg· για HTTP χρειάζεται κατάλληλο πρόγραμμα, όπως Browser.element, με ρητές εντολές.

### Διάγνωση και επόμενο επίπεδο

- Αν λείπει το elm.json ή κάποια εξάρτηση, έλεγξε το elm init και τη διαθεσιμότητα πακέτων. Μην αποδώσεις πρόβλημα περιβάλλοντος στον κώδικα.
- Αν το Elm.Main δεν ορίζεται, έλεγξε διαδρομή παραγόμενου αρχείου, σειρά φόρτωσης script και κονσόλα browser.
- Αν βλέπεις διπλό μετρητή, έλεγξε μήπως έγινε δεύτερη αρχικοποίηση ή υπάρχουν δύο containers.
- Πρόσθεσε μήνυμα Decrement και διατήρησε count >= 0 με max 0 (model.count - 1). Αιτιολόγησε ότι κάθε μήνυμα διατηρεί αυτή την ιδιότητα.

Για ολοκλήρωση χρειάζονται έκδοση μεταγλωττιστή, εντολή build, πραγματική παρατήρηση browser για δύο αυξήσεις και επαναφορά, ένα διαγνωστικό σφάλματος τύπου και τεκμηρίωση της ιδιότητας. Τα αναμενόμενα αποτελέσματα έχουν συναχθεί στατικά· δεν δηλώνεται εκτέλεση Elm κατά τη συγγραφή.
