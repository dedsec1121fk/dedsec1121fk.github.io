# object_pascal_delphi — συγκεντρωτικός οδηγός

## Object Pascal / Delphi

**Συνήθης χρήση:** Ιστορικές και επιχειρησιακές γλώσσες.

**Προτεινόμενη επέκταση αρχείου:** `.pas`.

**Εκτέλεση / περιβάλλον:** Μεταγλώττιση σε Delphi ή Free Pascal/Lazarus.

### Αρχικό παράδειγμα

```
program Hello;
{$APPTYPE CONSOLE}
begin
  Writeln('Hello, Ada!');
end.
```

### Πώς διαβάζεται

Η Delphi επεκτείνει την Pascal με μονάδες, κλάσεις και εργαλεία GUI.

### Συνηθισμένο λάθος

Η Delphi επεκτείνει την Pascal με μονάδες, κλάσεις και εργαλεία GUI. Έλεγξε την έκδοση διερμηνευτή/μεταγλωττιστή και μην εκλαμβάνεις το δείγμα ως έτοιμη εφαρμογή παραγωγής.

## Object_Pascal_Delphi — Αναλυτικός οδηγός εξάσκησης

### Μικρή αφετηρία πηγαίου κώδικα
~~~text
program Hello;
{$APPTYPE CONSOLE}
begin
  Writeln('Hello, Ada!');
end.
~~~

**Περιβάλλον:** Compile in Delphi or Free Pascal Lazarus.. Κράτησε αντίγραφο του αρχικού κώδικα και σημείωσε έκδοση εργαλείου. Ξεχώρισε αν η εκτέλεση επιστρέφει τιμή, εμφανίζει κείμενο ή αλλάζει state. Για τις πρώτες δοκιμές χρησιμοποίησε απομονωμένο περιβάλλον, όχι πραγματικούς λογαριασμούς ή δεδομένα.

### Ανάλυση του ιδιαίτερου μηχανισμού
Όρισε class με constructor/destructor, owned collection και έλεγξε cleanup σε exception. Σύγκρινε Free με FreeAndNil σε ελεγχόμενο δείγμα.

### Διάγνωση κρίσιμου ορίου
Ownership και managed types διαφέρουν μεταξύ targets. Μη θεωρείς ότι κάθε form event καθαρίζει objects.

## Object_Pascal_Delphi — Διαδρομή ουσιαστικής εξάσκησης

### Ειδικές προχωρημένες δοκιμές
Δημιούργησε class Delphi/Free Pascal με constructor/destructor και εξήγησε ownership της allocation.

Χρησιμοποίησε owning collection, προκάλεσε exception κατά την εισαγωγή και έλεγξε cleanup με try/finally. Σύγκρινε Free και FreeAndNil.

Γράψε local UTF-8 catalog με objects, invalid-input test και σταθερό sorting. Δήλωσε διαφορές compiler/RTL μεταξύ Delphi και Free Pascal.
