# powershell — συγκεντρωτικός οδηγός

## PowerShell

### Έννοια
Η PowerShell περνά structured objects μέσα από pipelines και αξιοποιεί .NET, αντί για απλή ανταλλαγή κειμένου.

### Παράδειγμα πηγαίου κώδικα ή χρήσης
```text
1..5 | Where-Object { $_ % 2 -eq 1 } | Measure-Object -Sum
```

### Άσκηση με συγκεκριμένο στόχο
Εξέτασε την ιδιότητα Sum και δοκίμασε άδεια είσοδο. Ξεχώρισε το πραγματικό object από το formatted κείμενο.

### Έλεγχος και διάγνωση
Τα formatting commands προορίζονται για εμφάνιση και μπορεί να χαλάσουν downstream property access· κράτα objects.

Σημείωσε την είσοδο, το αναμενόμενο αποτέλεσμα και το πραγματικό αποτέλεσμα στην εγκατεστημένη έκδοση της PowerShell. Αν ο κώδικας δεν είναι προσβάσιμος από το κινητό, κράτησε το παράδειγμα ως μη δοκιμασμένο και εξήγησε τη σημασιολογία αντί να ισχυριστείς επιτυχία. Κάνε μια δεύτερη δοκιμή που απομονώνει μόνο τον μηχανισμό της άσκησης και κράτησε ακριβές σφάλμα με τρόπο που να μην εκθέτει προσωπικά δεδομένα.

## PowerShell — Αναλυτικός οδηγός εξάσκησης

### Στόχος
Μέτρα έγκυρες καταστάσεις σε CSV χωρίς να ερμηνεύονται ονόματα αρχείων ως wildcard patterns. Η PowerShell επεξεργάζεται αντικείμενα, όχι μόνο γραμμές κειμένου. Η Import-Csv επιστρέφει πεδία που χρειάζονται έλεγχο πριν θεωρηθούν έμπιστα.

### Εκτέλεση
Αποθήκευσε report.ps1 και φτιάξε events.csv με name,status και σειρές Ada,ok; Grace,fail; Ada,ok. Σε PowerShell τρέξε ./report.ps1 -Path ./events.csv. Περιμένεις ok=2; fail=1. Οι πολιτικές εκτέλεσης διαφέρουν ανά περιβάλλον· μην απενεργοποιείς τυφλά ρυθμίσεις ασφαλείας.

~~~powershell
param([Parameter(Mandatory=$true)][string]$Path)
$ErrorActionPreference = "Stop"
if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
    throw "Missing input file"
}
$counts = @{ ok = 0; fail = 0 }
foreach ($row in (Import-Csv -LiteralPath $Path -Encoding utf8)) {
    if ([string]::IsNullOrWhiteSpace($row.name)) {
        throw "Missing name"
    }
    if ($row.status -notin @("ok", "fail")) {
        throw "Invalid status"
    }
    $counts[$row.status] = [int]$counts[$row.status] + 1
}
"ok=$($counts['ok']); fail=$($counts['fail'])"
~~~

### Σημασία επιλογών
Το -LiteralPath αποφεύγει wildcard ερμηνεία χαρακτήρων [ και ]. Το -Encoding utf8 καθορίζει κωδικοποίηση. Το ErrorActionPreference Stop χειρίζεται σφάλματα που αλλιώς μπορεί να συνεχίσουν. Το throw εκφράζει αποτυχία σύμβασης. Το hashtable κρατά μετρήσεις με συγκεκριμένες πεζές τιμές status.

### Ασκήσεις
Δοκίμασε άδειο αρχείο, διαδρομή που λείπει, κεφαλίδα που λείπει, κόμμα μέσα σε όνομα με εισαγωγικά, κεφαλαίο status και κενό όνομα. Το δείγμα σήμερα δέχεται άδειο αρχείο με μηδενικά και απορρίπτει κεφαλαίο status· επέλεξε συνειδητά αν ταιριάζει στις απαιτήσεις. Πρόσθεσε αυστηρό έλεγχο κεφαλίδας.

### Διάγνωση
Δες $PSVersionTable.PSVersion και Get-Command Import-Csv. Στο Linux/Termux η PowerShell δεν υπάρχει απαραίτητα. Έλεγξε encoding και διαδρομές με αγκύλες ή κενά. Μη χρησιμοποιείς Invoke-Expression πάνω σε δεδομένα CSV.
Επιτυχία: δύο ok, ένα fail, χωρίς modules. https://learn.microsoft.com/powershell/module/microsoft.powershell.utility/import-csv

## PowerShell — Παραδείγματα πραγματικού κώδικα

### Εκτέλεση των παραδειγμάτων

Τα παραδείγματα είναι μικρά και αυτοτελή. Χρησιμοποίησε τη σχετική εγκατεστημένη γλώσσα. Ενδεικτικά: `pwsh -File {file}`. Μη συγχέεις τα ονόματα αρχείων με αυτόματη εγκατάσταση. Δούλεψε σε δοκιμαστικό φάκελο.


## PowerShell — Διαδρομή ουσιαστικής εξάσκησης

### Τι πρέπει να πετύχεις
Δημιούργησε ταξινομημένο CSV με στήλες Relative και Bytes για τα αρχεία ενός επιλεγμένου καταλόγου. Οι διαδρομές μπορεί να έχουν κενά, αγκύλες ή ελληνικούς χαρακτήρες. Αποτυχία πρόσβασης πρέπει να τερματίζει τη διαδικασία: μία μισή αναφορά δεν θεωρείται επιτυχία. Το πρόγραμμα δεν διαγράφει ούτε μετονομάζει αρχεία και αποθηκεύει την αναφορά εκτός του καταλόγου ελέγχου.

### Εκτελέσιμο παράδειγμα για PowerShell 7
Αποθήκευσε ως inventory.ps1 και εκτέλεσε pwsh -NoProfile -File ./inventory.ps1 -Root './fixture [demo]' -Output './inventory.csv'. Δημιούργησε πρώτα προσωρινό δοκιμαστικό κατάλογο. Η μέθοδος GetRelativePath απαιτεί σύγχρονη έκδοση .NET, όπως αυτή που χρησιμοποιεί η PowerShell 7.

~~~powershell
param(
  [Parameter(Mandatory = $true)][string]$Root,
  [Parameter(Mandatory = $true)][string]$Output
)
$ErrorActionPreference = 'Stop'
$dir = (Resolve-Path -LiteralPath $Root -ErrorAction Stop).ProviderPath
if (-not (Test-Path -LiteralPath $dir -PathType Container)) {
    throw 'Root must be a directory'
}
# The output should be OUTSIDE Root to avoid including a previous report.
$records = @(Get-ChildItem -LiteralPath $dir -File -Recurse -ErrorAction Stop |
    Sort-Object -Property FullName |
    ForEach-Object {
        [pscustomobject]@{
            Relative = [System.IO.Path]::GetRelativePath($dir, $_.FullName)
            Bytes    = [int64]$_.Length
        }
    })
if ($records.Count -eq 0) {
    Set-Content -LiteralPath $Output -Value 'Relative,Bytes' -Encoding utf8
} else {
    $records | Export-Csv -LiteralPath $Output -NoTypeInformation -Encoding utf8
}
Write-Output ("PASS: {0} files inventoried" -f $records.Count)
~~~

### Πρακτικοί έλεγχοι
Εκτέλεσε το πρόγραμμα σε άδειο κατάλογο: το CSV πρέπει και πάλι να περιέχει τις επικεφαλίδες Relative,Bytes. Πρόσθεσε ένα μικρό αρχείο alpha.txt, ένα αρχείο σε υποκατάλογο και ένα με ελληνικό όνομα. Έλεγξε σε πρόγραμμα απλού κειμένου την κωδικοποίηση UTF-8 και θυμήσου ότι η στήλη Bytes μετρά **byte**, όχι χαρακτήρες. Δύο διαδοχικές εκτελέσεις με ίδια δεδομένα πρέπει να δίνουν την ίδια σειρά γραμμών.

### Ακραίες περιπτώσεις και διάγνωση
1. Χρησιμοποίησε όνομα καταλόγου με αγκύλες. Η -LiteralPath διαβάζει ακριβώς αυτό το όνομα χωρίς να αντιμετωπίζει τις αγκύλες ως σύμβολα αντιστοίχισης.
2. Δώσε ανύπαρκτη διαδρομή ή διαδρομή αρχείου αντί καταλόγου και αποθήκευσε το μήνυμα σφάλματος. Μην παρακάμπτεις δικαιώματα πρόσβασης με ανύψωση προνομίων.
3. Δοκίμασε μη εγγράψιμο προορισμό. Αν αποτύχει η δημιουργία CSV, δεν πρέπει να αναφέρεται επιτυχία. Σε πραγματική εφαρμογή γράψε πρώτα προσωρινό αρχείο και αντικατάστησε το παλιό μόνο όταν τελειώσει σωστά η εγγραφή.
4. Αν το CSV ανοιχτεί σε λογιστικό φύλλο, ονόματα αρχείων από μη έμπιστη πηγή μπορεί να ερμηνευτούν ως τύποι. Τεκμηρίωσε πολιτική ασφαλούς διαχείρισης πριν κοινοποιήσεις την αναφορά.

**Παραδοτέα:** δείγμα CSV, έλεγχος UTF-8, δύο ίδιες διαδοχικές εκτελέσεις, δύο περιπτώσεις αποτυχίας και η έκδοση PowerShell. Μπορείς να γράψεις ελέγχους Pester αν είναι εγκατεστημένο, όχι όμως να υποθέσεις ότι υπάρχει.

## PowerShell — Τεχνικά σημεία και συχνές παγίδες

### Τεχνική γνώση

1. Τα pipelines PowerShell μεταφέρουν αντικείμενα, όχι μόνο απλό κείμενο.
2. Το -LiteralPath αποτρέπει ερμηνεία ειδικών χαρακτήρων ως wildcards.
3. Απόφυγε Invoke-Expression σε εξωτερική είσοδο και έλεγξε τις παρενέργειες των cmdlets.
