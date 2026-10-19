# Αποτυχίες και ιδιοκτησία μνήμης σε κώδικα συστημάτων

## Bash: απουσία ελέγχου αποτυχίας

### Λανθασμένο παράδειγμα — ΜΗ ΧΡΗΣΙΜΟΠΟΙΕΙΤΑΙ

```text
cp "$src" "$dst"
echo "Backup complete"
```

### Διορθωμένο παράδειγμα

```text
if cp -- "$src" "$dst"; then
  echo "Backup complete"
else
  echo "Backup failed" >&2
  exit 1
fi
```

### Αιτία σφάλματος και εξήγηση διόρθωσης

Ανακοίνωσε επιτυχία μόνο όταν η ενέργεια ολοκληρώθηκε.

### Άσκηση: σκόπιμη αποτυχία εισόδου/εξόδου
Χωρίς χειρισμό σφαλμάτων, η τελευταία εντολή καθορίζει συχνά το exit status του script. Ένα ανεπιφύλακτο μήνυμα επιτυχίας μπορεί να κρύψει αποτυχημένο αντίγραφο. Έλεγξε την ίδια την εργασία και επέστρεψε μη μηδενικό status όταν αποτυγχάνει.

~~~bash
#!/usr/bin/env bash
set -euo pipefail
tmp=$(mktemp -d)
src="$tmp/source.txt"
dst="$tmp/backup.txt"
trap 'rm -f -- "$src" "$dst"; rmdir -- "$tmp"' EXIT
printf 'verified content\n' > "$src"
backup() {
  if cp -- "$1" "$2"; then
    printf 'Backup complete\n'
  else
    printf 'Backup failed\n' >&2
    return 1
  fi
}
backup "$src" "$dst"
cmp -- "$src" "$dst"
if backup "$tmp/missing.txt" "$dst"; then
  exit 1
fi
cmp -- "$src" "$dst"
printf 'Expected failure detected; valid backup preserved\n'
~~~

Τρέξε `bash backup_lab.sh`. Η ανύπαρκτη πηγή πρέπει να προκαλεί αποτυχία και το προηγούμενο έγκυρο backup να παραμένει ίδιο. Το `set -e` έχει εξαιρέσεις σε συνθήκες και pipelines, επομένως χρειάζονται ρητοί έλεγχοι. Σε pipelines πρόσθεσε `pipefail`. Για κρίσιμα backups γράψε προσωρινό αρχείο, επαλήθευσέ το και μετονόμασέ το στον ίδιο δίσκο μόνο μετά την επιτυχία.

## C: ανεξέλεγκτη είσοδος buffer

### Λανθασμένο παράδειγμα — ΜΗ ΧΡΗΣΙΜΟΠΟΙΕΙΤΑΙ

```text
char name[16];
scanf("%s", name);
```

### Διορθωμένο παράδειγμα

```text
char name[16];
if (fgets(name, sizeof name, stdin) == NULL) return 1;
```

### Αιτία σφάλματος και εξήγηση διόρθωσης

Χρησιμοποίησε ανάγνωση με όριο και έλεγχο αποτελέσματος.

### Πλήρης άσκηση ορίων εισόδου C11
Το `scanf("%s", name)` χωρίς περιορισμό μπορεί να γράψει έξω από τον πίνακα. Το `fgets` περιορίζει την ανάγνωση και τερματίζει επιτυχημένο string με NUL, αλλά μια μεγάλη γραμμή μπορεί να αφήσει δεδομένα για το επόμενο prompt. Απέρριψε ρητά την υπερβολικά μεγάλη είσοδο.

~~~c
#include <stdio.h>
#include <string.h>
int main(void) {
    char name[16];
    if (!fgets(name, sizeof name, stdin)) return 1;
    size_t n = strcspn(name, "\n");
    if (name[n] == '\n') {
        name[n] = '\0';
    } else if (n == sizeof name - 1) {
        fputs("Input too long\n", stderr);
        return 2;
    }
    printf("Hello, %s\n", name);
    return 0;
}
~~~

Μεταγλώττισε: `cc -std=c11 -Wall -Wextra -pedantic input.c -o input`. Το `printf 'Ada\n' | ./input` πρέπει να πετύχει, ενώ το `printf 'abcdefghijklmnop\n' | ./input` να επιστρέψει 2. Κενό stdin επιστρέφει 1. Το παράδειγμα δέχεται έως 14 χαρακτήρες μαζί με newline, επειδή κρατά ένα byte για NUL. Συντηρητικά απορρίπτει γραμμή 15 χαρακτήρων χωρίς newline· προσαρμόζεις την πολιτική EOF στο πρωτόκολλό σου. Τα sanitizers δεν αντικαθιστούν ελέγχους ορίων.

## C++: ιδιοκτησία πόρων

### Λανθασμένο παράδειγμα — ΜΗ ΧΡΗΣΙΜΟΠΟΙΕΙΤΑΙ

```text
int* p = new int(7);
// forgotten delete
```

### Διορθωμένο παράδειγμα

```text
auto p = std::make_unique<int>(7);
// include <memory>
```

### Αιτία σφάλματος και εξήγηση διόρθωσης

Το RAII απελευθερώνει τη μνήμη όταν λήγει η εμβέλεια.

### Πλήρες εργαστήριο ιδιοκτησίας (C++17)

Το κρίσιμο ερώτημα είναι ποιος αποδεσμεύει τον πόρο σε κάθε διαδρομή εκτέλεσης, ακόμη και μετά από εξαίρεση. Το unique_ptr εκφράζει αποκλειστική ιδιοκτησία· το move μεταφέρει την ιδιοκτησία χωρίς να τη διπλασιάζει.

~~~cpp
#include <cassert>
#include <memory>
#include <utility>
int main() {
    auto first = std::make_unique<int>(7);
    assert(*first == 7);
    auto second = std::move(first);
    assert(!first);
    assert(second && *second == 7);
    second.reset();
    assert(!second);
}
~~~

Μεταγλώττισε: `c++ -std=c++17 -Wall -Wextra -pedantic ownership.cpp -o ownership && ./ownership`. Για αρνητικό τεστ προσπάθησε να αντιγράψεις το second σε άλλο unique_ptr: ο compiler πρέπει να απορρίψει την αντιγραφή. Προτίμησε απλές τιμές ή vector όπου δεν χρειάζεται δυναμική ιδιοκτησία· shared_ptr μόνο όταν πολλοί ιδιοκτήτες μοιράζονται πραγματικά το lifetime.
