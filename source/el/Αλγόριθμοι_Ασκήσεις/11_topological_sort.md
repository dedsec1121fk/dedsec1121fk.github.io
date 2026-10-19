# Τοπολογική σειρά — εξαρτήσεις πριν από τις εργασίες

## Python 3 reference source
~~~python
from collections import deque
def topological(graph):
    nodes = set(graph)
    for children in graph.values(): nodes.update(children)
    indegree = {node: 0 for node in nodes}
    for children in graph.values():
        for child in children: indegree[child] += 1
    queue = deque(sorted(node for node in nodes if indegree[node] == 0))
    order = []
    while queue:
        node = queue.popleft(); order.append(node)
        for child in graph.get(node, []):
            indegree[child] -= 1
            if indegree[child] == 0: queue.append(child)
    if len(order) != len(nodes): raise ValueError('cycle')
    return order
assert topological({'a':['b'], 'b':['c']}) == ['a','b','c']
~~~

## Κανόνας γράφου
Η ακμή a→b σημαίνει ότι το a πρέπει να προηγηθεί του b. Ο αλγόριθμος Kahn μετρά indegree για **όλους** τους κόμβους, ακόμη κι αν εμφανίζονται μόνο ως children. Όσοι έχουν μηδενικό indegree μπαίνουν σε ουρά. Όταν αφαιρούμε κόμβο, μειώνουμε τις εισερχόμενες εξαρτήσεις των γειτόνων του. Αν δεν επισκεφτούμε όλες τις κορυφές, υπάρχει κύκλος και καμία έγκυρη σειρά.

## Τι δεν εγγυάται
Αρχικά η ουρά δημιουργείται από sorted μηδενικά indegrees, αλλά οι επόμενοι κόμβοι μπαίνουν σύμφωνα με τη λίστα γειτόνων. Άρα η έξοδος δεν είναι υποχρεωτικά η λεξικογραφικά μικρότερη δυνατή. Η αρχική sorted απαιτεί συγκρίσιμα ονόματα κόμβων. Ένας DAG μπορεί να έχει περισσότερες από μία σωστές σειρές.

## Πειράματα
1. Για a→b→c πρέπει να πάρεις [a,b,c].
2. Πρόσθεσε c→a και περίμενε ValueError('cycle'), όχι φαινομενικά επιτυχημένη μερική σειρά.
3. Πρόσθεσε απομονωμένο z ως key. Πρέπει να εμφανίζεται μία φορά στην έξοδο.
4. Για ανεξάρτητα a και b που οδηγούν στο c, ισχύουν διαφορετικές σωστές σειρές.
5. Δοκίμασε δύο όμοιες ακμές a→b. Η υλοποίηση αυξάνει και μειώνει το indegree δύο φορές· αποφάσισε αν επιτρέπεις duplicates στο μοντέλο.

## Χρήση
Μπορείς να οργανώσεις offline builds ή migrations με εξαρτήσεις. Έλεγξε κάθε ακμή με assertion position[parent] < position[child]. Η ταξινομημένη λίστα δεν εκτελεί τις εργασίες ούτε εγγυάται την επιτυχία τους.

## 11 topological sort — έλεγχος ορίων

Τοπολογική διάταξη υπάρχει μόνο σε κατευθυνόμενο άκυκλο γράφο (DAG). Η ουρά κρατά κόμβους με βαθμό εισόδου μηδέν· η αφαίρεσή τους μειώνει το βαθμό των διαδόχων. Αν απομείνουν κόμβοι, υπάρχει κύκλος.

Ένας γράφος μπορεί να έχει πολλές σωστές διατάξεις· μην απαιτείς μία μοναδική σειρά για ανεξάρτητους κόμβους. Έλεγξε κάθε εξάρτηση πριν από τον εξαρτημένο κόμβο.

<!-- [curated-algorithm-detail:11_topological_sort.md] -->
## Διάγνωση κύκλου εξαρτήσεων αντί μερικής σειράς

Ο αλγόριθμος Kahn αφαιρεί επανειλημμένα κορυφές μηδενικού εισερχόμενου βαθμού. Αν η ουρά αδειάσει πριν εκπέμψει όλες τις κορυφές, το υπόλοιπο περιέχει κύκλο. Η επιστροφή του προθέματος ως πλήρους σειράς κατασκευής κρύβει ανικανοποίητη εξάρτηση.

Το υπόλοιπο μπορεί να περιλαμβάνει κορυφές που απλώς μπλοκάρονται πίσω από κύκλο. Είναι χρήσιμο διαγνωστικό αλλά όχι απαραίτητα ο ίδιος ο κύκλος. Χρειάζεται επιπλέον DFS ή ανάλυση ισχυρά συνεκτικών συνιστωσών για ακριβή μαρτυρία κύκλου.

```python
from collections import deque
graph = {"a":["b"], "b":["a","c"], "c":[], "free":[]}
indegree = dict.fromkeys(graph,0)
for edges in graph.values():
    for node in edges: indegree[node] += 1
queue = deque(n for n,d in indegree.items() if d == 0); order=[]
while queue:
    node=queue.popleft(); order.append(node)
    for nxt in graph[node]:
        indegree[nxt] -= 1
        if indegree[nxt] == 0: queue.append(nxt)
blocked = set(graph) - set(order)
assert order == ["free"] and blocked == {"a","b","c"}
print("cycle blocks",sorted(blocked))
```

Πρόσθεσε αυτοεξάρτηση και έγκυρο αποσυνδεδεμένο DAG. Εξήγησε αν έτοιμες παράλληλες εργασίες ταξινομούνται λεξικά ή με σειρά εισόδου. Μην ονομάζεις κάθε μπλοκαρισμένη κορυφή μέλος κύκλου χωρίς τα απαραίτητα στοιχεία.

[Τεχνική αναφορά](https://docs.python.org/3/library/graphlib.html)
