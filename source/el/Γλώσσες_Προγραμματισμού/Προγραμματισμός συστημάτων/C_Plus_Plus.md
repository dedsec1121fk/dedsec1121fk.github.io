# c_plus_plus — συγκεντρωτικός οδηγός

## C++

**Συνήθης χρήση:** Προγραμματισμός συστημάτων.

**Προτεινόμενη επέκταση αρχείου:** `.cpp`.

**Εκτέλεση / περιβάλλον:** c++ -std=c++17 main.cpp -o main && ./main.

### Αρχικό παράδειγμα

```
#include <iostream>
#include <string>
std::string greet(const std::string& n) { return "Hello, " + n + "!"; }
int main() { std::cout << greet("Ada") << '\n'; }
```

### Πώς διαβάζεται

Χρησιμοποίησε τυπικές δομές και RAII για ασφαλείς πόρους.

### Συνηθισμένο λάθος

Χρησιμοποίησε τυπικές δομές και RAII για ασφαλείς πόρους. Έλεγξε την έκδοση διερμηνευτή/μεταγλωττιστή και μην εκλαμβάνεις το δείγμα ως έτοιμη εφαρμογή παραγωγής.

### Πρώτα ownership, έπειτα αφαιρέσεις στην C++
Στη σύγχρονη C++ προτίμησε values και RAII αντί για ατελείωτο `new`/`delete`. Το `std::vector` κατέχει στοιχεία, το `std::string` κείμενο και το `std::unique_ptr` μοναδική ιδιοκτησία heap allocation. Το `std::span` είναι view, δεν παρατείνει lifetime.
```cpp
#include <vector>
#include <numeric>
#include <stdexcept>
int average_floor(const std::vector<int>& values) {
    if (values.empty()) throw std::invalid_argument("empty");
    long long total = std::accumulate(values.begin(), values.end(), 0LL);
    return static_cast<int>(total / static_cast<long long>(values.size()));
}
```
Χρησιμοποίησε `const&` για μεγάλα read-only objects όταν χρειάζεται, value για μικρές scalar τιμές και move semantics για μεταφορά ownership. Πρόσεχε dangling references, invalidated iterators μετά από vector reallocation, και ότι τα bytes του `std::string` δεν είναι αυτομάτως Unicode χαρακτήρες.

**Εργαστήριο:** έλεγξε θετικές/αρνητικές τιμές· εξήγησε γιατί ένα span σε προσωρινό container είναι επικίνδυνο. Χρησιμοποίησε sanitizers σε δικά σου binaries.

## C_Plus_Plus — Αναλυτικός οδηγός εξάσκησης

### Επιλογή interface
Η συνάρτηση CLI μπορεί να επιστρέψει std::optional<int> αντί για ειδική τιμή αποτυχίας -1. Η std::from_chars αποφεύγει exceptions και μετατροπές αριθμών που εξαρτώνται από locale. Ο έλεγχος του τελικού pointer απορρίπτει μη επιθυμητά επιθήματα.

### Μεταγλώττιση
Αποθήκευσε main.cpp και τρέξε g++ -std=c++17 -Wall -Wextra main.cpp -o parser && ./parser. Περιμένεις C++ parser OK. Απαιτείται υποστήριξη C++17 για optional και charconv.

~~~cpp
#include <charconv>
#include <iostream>
#include <optional>
#include <string_view>
std::optional<int> parsePort(std::string_view text) {
    if (text.empty()) return std::nullopt;
    int value = 0;
    auto first = text.data();
    auto last = first + text.size();
    auto answer = std::from_chars(first, last, value);
    if (answer.ec != std::errc{} || answer.ptr != last ||
        value < 1 || value > 65535) return std::nullopt;
    return value;
}
int main() {
    if (parsePort("443") != 443 ||
        parsePort("12x").has_value() ||
        parsePort("65536").has_value()) return 1;
    std::cout << "C++ parser OK\n";
}
~~~

### Κατανόηση
Το ec ενημερώνει για αποτυχία μετατροπής, ενώ το ptr δείχνει πού σταμάτησε η ανάγνωση. Με ptr != last απορρίπτεται το "12x". Η παρούσα υλοποίηση απορρίπτει αρχικά κενά, δεν τα αφαιρεί αυτόματα. Ελέγχει επίσης 1..65535.

### Παραλλαγές
Δοκίμασε κενό, -1, +42, 0008, τελικά κενά και υπερβολικά μεγάλο αριθμό. Εξέτασε πώς χειρίζεται το from_chars το + και αποφάσισε αν επιτρέπεται. Πρόσθεσε trim που επιστρέφει string_view χωρίς νέα allocation και επανέλαβε τα tests.

### Lifetimes και σφάλματα
Το string_view δεν κατέχει τη μνήμη. Μην αποθηκεύεις view που δείχνει σε προσωρινή συμβολοσειρά που καταστράφηκε. Το optional αποτέλεσμα κατέχει έναν int και δεν έχει το ίδιο πρόβλημα. Αν η βιβλιοθήκη δεν παρέχει from_chars, εξέτασε έκδοση compiler και standard library αντί να προσθέτεις άσχετα headers.
Επιτυχία: μία έγκυρη και δύο λανθασμένες τιμές. https://en.cppreference.com/w/cpp/utility/from_chars.html

## C_Plus_Plus — Παραδείγματα πραγματικού κώδικα

### Εκτέλεση των παραδειγμάτων

Τα παραδείγματα είναι μικρά και αυτοτελή. Χρησιμοποίησε τη σχετική εγκατεστημένη γλώσσα. Ενδεικτικά: `c++ -std=c++17 -Wall -Wextra {file} -o demo && ./demo`. Μη συγχέεις τα ονόματα αρχείων με αυτόματη εγκατάσταση. Δούλεψε σε δοκιμαστικό φάκελο.


## C_Plus_Plus — Διαδρομή ουσιαστικής εξάσκησης

### Μια όψη χωρίς αντιγραφή
Το std::span αποθηκεύει μη ιδιοκτησιακή όψη σε συνεχόμενα στοιχεία. Δεν παρατείνει τη ζωή της αρχικής περιοχής μνήμης και δεν αποκλείει δείκτες που αργότερα θα πάψουν να ισχύουν. Η ασφάλεια προκύπτει από τις συμβάσεις ownership, όχι από το όνομα του container.

~~~cpp
#include <array>
#include <span>
#include <iostream>
int sum_first_two(std::span<const int> values) {
    if (values.size() < 2) return 0;
    return values[0] + values[1];
}
int main() {
    std::array<int, 3> data{3, 5, 7};
    std::cout << sum_first_two(data) << '\n';
}
~~~

Η αναμενόμενη εκτύπωση είναι 8. Ο έλεγχος size γίνεται πριν από κάθε χρήση του operator[] επειδή η indexing πράξη δεν παρέχει γενική εγγύηση runtime bounds validation. Για span με 0 ή 1 στοιχείο, η συνάρτηση επιστρέφει 0 χωρίς να διαβάσει ανύπαρκτο δεύτερο στοιχείο.

### Κίνδυνος με dangling views
Αν κατασκευάσεις τοπικό std::vector μέσα σε συνάρτηση και επιστρέψεις span προς αυτό, το span θα αναφέρεται σε μνήμη της οποίας η διάρκεια ζωής τελείωσε. Η σωστή διόρθωση είναι να επιστρέφεις owning container ή να ζητάς από τον caller να διατηρεί τον owner όσο χρησιμοποιείται η όψη. Δοκίμασε το επικίνδυνο αντιπαράδειγμα μόνο σε ελεγχόμενο sanitizer harness και μη θεωρείς ότι κάθε μη ασφαλές πρόγραμμα θα καταρρεύσει εμφανώς.

### Επιλογές ιδιοκτησίας
Το std::unique_ptr εκφράζει μοναδική ιδιοκτησία ενός πόρου. Το std::shared_ptr προσθέτει shared ownership, αλλά κύκλοι shared_ptr μπορούν να κρατούν αντικείμενα ζωντανά χωρίς λόγο· η std::weak_ptr προσφέρει μη owning αναφορά για τέτοιες σχέσεις.

### Εργασία ελέγχου
Γράψε parser με std::span<const std::byte> που διαβάζει big-endian κεφαλίδα 2 bytes μόνο αφού ελέγξει το μέγεθος. Δοκίμασε κενό input, ακριβώς δύο bytes και δηλωμένο payload μεγαλύτερο από το buffer. Χρησιμοποίησε compiler με C++20 mode, warnings και sanitizers όπου υπάρχουν. Κατάγραψε τι εκτελέστηκε και τι παραμένει θεωρητική αναμενόμενη συμπεριφορά.

## C Plus Plus — Τεχνικά σημεία και συχνές παγίδες

### Τεχνική γνώση

1. Το RAII συνδέει καθαρισμό πόρων με χρόνο ζωής αντικειμένου· προτίμησε βιβλιοθήκες συλλογών.
2. Αναφορές, απλοί δείκτες και smart pointers έχουν διαφορετικούς κανόνες ιδιοκτησίας.
3. Η απροσδιόριστη συμπεριφορά δεν είναι κανονική εξαίρεση και μπορεί να δώσει απρόβλεπτα αποτελέσματα.
## RAII σε μερική κατασκευή και εξαιρέσεις

Το RAII συνδέει την ιδιοκτησία πόρου με τη διάρκεια ζωής αντικειμένου. Αν μεταγενέστερη πράξη πετάξει εξαίρεση, ήδη κατασκευασμένα αυτόματα αντικείμενα καταστρέφονται κατά την εκτύλιξη στοίβας. Ένας σκέτος δείκτης ή ακέραιος descriptor δεν αποκτά αυτή τη συμπεριφορά μόνο επειδή είναι τοπικός.

Προτίμησε μικρό περιτύλιγμα ιδιοκτησίας ή τυπικό smart pointer και ρητή μεταβίβαση. Ο destructor κανονικά απελευθερώνει χωρίς να πετά εξαίρεση. Το δείγμα μετρά ενεργούς πόρους ώστε η διαδρομή εξαίρεσης να δίνει μετρήσιμα στοιχεία και όχι απλώς απουσία κατάρρευσης.

```cpp
#include <cassert>
#include <memory>
#include <stdexcept>
struct Resource {
    static int live;
    Resource() { ++live; }
    ~Resource() { --live; }
    Resource(const Resource&)=delete;
    Resource& operator=(const Resource&)=delete;
};
int Resource::live=0;
int main() {
    try { auto item=std::make_unique<Resource>(); throw std::runtime_error("fixture"); }
    catch (const std::runtime_error&) {}
    assert(Resource::live==0);
}
```

Δοκίμασε αποτυχία κατά την απόκτηση δεύτερου πόρου και επιτυχή μεταβίβαση. Δανεισμένες αναφορές δεν πρέπει να επιβιώνουν του ιδιοκτήτη. Το RAII καλύπτει καθαρισμό μέσα στη διεργασία, χωρίς υπόσχεση destructor μετά από απότομο τερματισμό ή διακοπή ρεύματος.

[Τεχνική αναφορά](https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines#Rr-raii)
