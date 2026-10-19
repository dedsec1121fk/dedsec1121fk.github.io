# Managed κώδικας και metadata

## Βασική έννοια

Πολλά .NET assemblies έχουν types, members και Common Intermediate Language αντί για άμεσες CPU instructions. Το Native AOT διαφέρει, άρα πρώτα αναγνωρίζουμε τον τύπο.

## Χωρίς AI: πράξη

Κάνε compile μικρή κλάση C# και σύγκρινε τον κώδικα με metadata σε offline viewer. Ξεχώρισε signatures από πραγματικές κλήσεις.

## Επαλήθευση

Εξήγησε γιατί το signature μιας μεθόδου δεν εγγυάται εκτέλεση με συγκεκριμένη είσοδο.

## Προαιρετικά με AI

Ζήτησε από AI διάκριση γεγονότων metadata, ερμηνείας CIL και μη ελεγμένων ισχυρισμών.

## Πρακτικό εργαστήριο: metadata, CIL και εκτέλεση

Ένα managed assembly μπορεί να περιέχει ονόματα τύπων, μεθόδους, αναφορές και Common Intermediate Language. Η παρουσία τους αποδεικνύει δομή, όχι ότι εκτελέστηκε συγκεκριμένη μέθοδος.

Με εγκατεστημένο .NET SDK φτιάξε το παρακάτω δικό σου πρόγραμμα:

~~~csharp
using System;
class Program {
    static int Classify(int x) => x < 0 ? -1 : x == 0 ? 0 : 1;
    static void Main() => Console.WriteLine(Classify(0));
}
~~~

Κάνε Debug και Release build και κράτησε την έξοδο (αναμένεται 0). Σε κατάλληλο IL viewer βρες τη μέθοδο Classify και εξέτασε τις διακλαδώσεις. Όπου υπάρχει IL Disassembler, το ildasm επιτρέπει επιθεώρηση metadata· η διαθεσιμότητα διαφέρει ανά SDK/OS. Δοκίμασε -1, 0 και 8 με αναμενόμενες εξόδους -1, 0 και 1 και διαχώρισε μετρημένη συμπεριφορά από εκτίμηση.

Ο ορισμός μεθόδου δεν σημαίνει κλήση. Εξαιρέσεις, virtual dispatch και JIT/NativeAOT μπορούν να επηρεάζουν τον εκτελέσιμο κώδικα. Τα σύμβολα βοηθούν με ονόματα αλλά δεν αποδεικνύουν ενέργειες.

Παραδοτέο: πίνακας υπογραφής, τεκμηρίου IL, εισόδου και πραγματικής εξόδου. Πηγή: https://learn.microsoft.com/en-us/dotnet/standard/assembly/view-contents.
