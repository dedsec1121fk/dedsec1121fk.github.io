# lua — συγκεντρωτικός οδηγός

## Lua

### Βασική ιδέα
Η Lua είναι ελαφριά embeddable γλώσσα με tables και first-class functions, συχνή σε παιχνίδια.

### Μικρό εκπαιδευτικό απόσπασμα
```text
local values = {2, 4, 6}
print(#values)
```

### Άσκηση βασισμένη στη συγκεκριμένη συμπεριφορά
Σύγκρινε το μήκος μιας συνεχόμενης λίστας με table που έχει κενό σε numeric keys.

### Διάγνωση και όρια
Τα Lua tables δεν είναι πάντα πυκνά arrays· οι πράξεις ακολουθίας χρειάζονται σωστά keys.

Κάνε την άσκηση με πραγματικά δοκιμαστικά δεδομένα και με έκδοση Lua που ταιριάζει στον κώδικα. Σημείωσε μία αρχική πρόβλεψη και την πραγματική έξοδο. Για περίπλοκο ή μη διαθέσιμο runtime, παρουσίασε τη στατική ανάλυση ως τέτοια, όχι ως επιτυχημένη εκτέλεση. Δοκίμασε ξεχωριστά την κανονική περίπτωση και μία οριακή τιμή, χωρίς πραγματικά προσωπικά ή παραγωγικά δεδομένα.

## Lua — Αναλυτικός οδηγός εξάσκησης

### Βασική ιδέα
Τα Lua tables χρησιμοποιούνται ως arrays, maps και records, αλλά οι κανόνες επανάληψής τους διαφέρουν. Η άσκηση διαβάζει συνεχόμενη ακολουθία εγγραφών με ipairs και δημιουργεί map με αθροίσματα. Πριν υπολογίσει, επικυρώνει ονόματα και ποσά.

### Εκτέλεση
Αποθήκευσε totals.lua και τρέξε lua totals.lua με εγκατεστημένη Lua. Περιμένεις book=7, pen=2. Δεν βασιζόμαστε στη σειρά των κλειδιών σε map, επειδή εκτυπώνουμε συγκεκριμένα ονόματα.

~~~lua
local function totals(rows)
  local out = {}
  for index, row in ipairs(rows) do
    assert(type(row.name) == "string" and row.name ~= "",
           "row " .. index .. ": invalid name")
    assert(type(row.amount) == "number" and row.amount >= 0 and
           row.amount < math.huge and row.amount == row.amount,
           "row " .. index .. ": invalid amount")
    out[row.name] = (out[row.name] or 0) + row.amount
  end
  return out
end
local data = totals({
  {name = "book", amount = 3},
  {name = "pen", amount = 2},
  {name = "book", amount = 4}
})
assert(data.book == 7 and data.pen == 2)
local ok = pcall(function()
  totals({{name = "book", amount = 0 / 0}})
end)
assert(not ok)
print("book=7, pen=2")
~~~

### Λεπτομέρειες
Το (out[row.name] or 0) δίνει προεπιλογή όταν δεν υπάρχει κλειδί. Το ipairs περνά από συνεχόμενους ακέραιους δείκτες, όχι από αυθαίρετο sparse table. Ο έλεγχος απορρίπτει αρνητικά, άπειρο και NaN. Το NaN δεν ισούται με τον εαυτό του. Το pcall μετατρέπει το assertion σε ελέγξιμη κατάσταση.

### Επέκταση
Ξαναγράψε τη συνάρτηση ώστε να επιστρέφει nil, μήνυμα αντί να χρησιμοποιεί assert σε εξωτερική είσοδο. Δοκίμασε όνομα που λείπει, κείμενο ως ποσό, sparse array, δεκαδικούς και ελληνικά κλειδιά. Για χρήματα εξήγησε γιατί ίσως χρειάζονται ακέραιες υποδιαιρέσεις μονάδας.

### Διάγνωση
Έλεγξε lua -v πριν χρησιμοποιήσεις APIs που διαφέρουν μεταξύ Lua 5.1, 5.4 και LuaJIT. Σε nil indexing επιθεώρησε το schema, όχι μόνο τον βρόχο. Σύγκρινε pairs και ipairs σε πίνακα με κενά στη σειρά.
Επιτυχία: σταθερό άθροισμα και απορριφθέν NaN. https://www.lua.org/manual/5.4/

## Lua — Παραδείγματα πραγματικού κώδικα

### Εκτέλεση των παραδειγμάτων

Τα παραδείγματα είναι μικρά και αυτοτελή. Χρησιμοποίησε τη σχετική εγκατεστημένη γλώσσα. Ενδεικτικά: `lua {file}`. Μη συγχέεις τα ονόματα αρχείων με αυτόματη εγκατάσταση. Δούλεψε σε δοκιμαστικό φάκελο.


## Lua — Διαδρομή ουσιαστικής εξάσκησης

### Όρια και προϋποθέσεις
Μία δήλωση πρόσθετου αντιμετωπίζεται ως **δεδομένα**, ποτέ ως κώδικας προς εκτέλεση. Επιτρέπονται μόνο οι ενέργειες scan και inspect, καθεμία το πολύ μία φορά, με ακέραιο όριο από 1 έως 10. Πίνακας με κενά ανάμεσα στους αριθμητικούς δείκτες πρέπει να απορρίπτεται. Αυτός ο μικρός έλεγχος δεν αντικαθιστά ένα περιβάλλον απομόνωσης μη έμπιστων πρόσθετων.

### Εκτελέσιμο πρόγραμμα για Lua 5.4
Αποθήκευσε ως manifest_lab.lua. Εκτέλεσε lua5.4 manifest_lab.lua ή χρησιμοποίησε lua αφού επιβεβαιώσεις την έκδοση με lua -v. Δεν δημιουργεί αρχεία και δεν εκτελεί το περιεχόμενο της δήλωσης.

~~~lua
local allowed = {inspect = true, scan = true}
local function check_manifest(items)
  assert(type(items) == "table", "expected an array")
  local count = 0
  for key in pairs(items) do
    assert(type(key) == "number" and math.type(key) == "integer" and key > 0, "invalid index")
    count = count + 1
  end
  local seen = {}
  for i = 1, count do
    local item = items[i]
    assert(type(item) == "table", "hole or invalid entry")
    assert(type(item.command) == "string" and allowed[item.command], "unknown command")
    assert(type(item.limit) == "number" and math.type(item.limit) == "integer"
           and item.limit >= 1 and item.limit <= 10, "limit outside range")
    assert(not seen[item.command], "duplicate command")
    seen[item.command] = true
  end
  return true
end

assert(check_manifest({{command = "scan", limit = 3},
                       {command = "inspect", limit = 10}}))
for _, bad in ipairs({
  {{command = "delete", limit = 1}},
  {{command = "scan", limit = 0}},
  {{command = "scan", limit = 3.5}},
  {{command = "scan", limit = 2}, {command = "scan", limit = 3}},
  {[1] = {command = "scan", limit = 1}, [3] = {command = "inspect", limit = 2}},
}) do
  assert(not pcall(check_manifest, bad), "bad input was accepted")
end
local sparse = {[1] = "first", [3] = "third"}
local visited = {}
for index in ipairs(sparse) do visited[#visited + 1] = index end
assert(#visited == 1 and visited[1] == 1)
print("PASS: bounded manifest, duplicates and sparse-array diagnostics")
~~~

### Οι παγίδες της γλώσσας
Η ipairs σταματά στον πρώτο ανύπαρκτο αριθμητικό δείκτη. Αν βασιστείς μόνο σε αυτήν, μπορεί να αγνοήσεις ύποπτη εγγραφή μετά το κενό. Ο πρώτος βρόχος με pairs μετρά και ελέγχει τους δείκτες, ενώ ο δεύτερος απορρίπτει τυχόν κενά. Η math.type ξεχωρίζει ακεραίους από αριθμούς κινητής υποδιαστολής στη Lua 5.4. Σε LuaJIT ή Lua 5.1 δεν ισχύει η ίδια διάκριση· απαιτείται διαφορετικός έλεγχος. Το σύνολο seen ανιχνεύει τις διπλές εντολές.

### Μικρές ασκήσεις και εντοπισμός προβλημάτων
1. Πρόσθεσε δείκτη 0, κλειδί κειμένου extra και κενό στη θέση 2. Βρες ποια συνθήκη απορρίπτει κάθε περίπτωση.
2. Δοκίμασε όρια 0, 11, 1.5 και math.huge. Εξήγησε την αποτυχία τους με βάση τον τύπο και το επιτρεπτό διάστημα. Για τιμές NaN κατάγραψε τη συμπεριφορά της συγκεκριμένης υλοποίησης.
3. Αντικατάστησε προσωρινά τη λίστα επιτρεπόμενων εντολών με έλεγχο μη κενού κειμένου. Δείξε ποια επικίνδυνη τιμή περνά πλέον και επανάφερε τον αυστηρό κανόνα.
4. Κατάγραψε την ακριβή έκδοση Lua. Σφάλμα επειδή λείπει η math.type σημαίνει ασύμβατη έκδοση, όχι επιτυχημένη επικύρωση.

**Παραδοτέα:** έξοδος PASS, πέντε αποτυχημένες περιπτώσεις και σύγκριση pairs/ipairs σε αραιό πίνακα. Χρησιμοποίησε μόνο δοκιμαστικά δεδομένα· η φόρτωση άγνωστου πρόσθετου δεν περιλαμβάνεται.

## Lua — Τεχνικά σημεία και συχνές παγίδες

### Τεχνική γνώση

1. Οι tables είναι η βασική συλλογή και αναπαριστούν λίστες ή χάρτες.
2. Οι δείκτες πινάκων Lua ξεκινούν συνήθως από το 1· έλεγξε επεκτάσεις engine.
3. Οι metatables αλλάζουν συμπεριφορά και απαιτούν ιδιαίτερη προσοχή.
