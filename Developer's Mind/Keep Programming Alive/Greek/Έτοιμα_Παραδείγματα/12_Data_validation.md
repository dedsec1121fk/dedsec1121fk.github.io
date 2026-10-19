# Συνταγή: αυστηρός έλεγχος ρυθμίσεων JSON πριν την εφαρμογή

## Σενάριο και κριτήρια επιτυχίας
Ένα εργαλείο χωρίς διαδίκτυο δέχεται ρυθμίσεις με ακριβώς τρία πεδία: mode, retries και tags. Το mode μπορεί να είναι offline ή preview, οι επαναλήψεις είναι ακέραιος από μηδέν έως τρία και οι ετικέτες είναι λίστα έως πέντε μοναδικών, μη κενών σύντομων συμβολοσειρών. Άγνωστα πεδία απορρίπτονται πριν μετατραπούν κατά λάθος σε νέες δυνατότητες, όπως ένα πλαστό πεδίο admin.

## Πλήρες εκτελέσιμο παράδειγμα
Αποθήκευσε ως `12_Data_validation.py` και εκτέλεσε με Python 3 και την ενσωματωμένη βιβλιοθήκη. Δεν απαιτείται διαδίκτυο ή πρόσβαση σε πραγματικά αρχεία σου.

~~~python
import json
def validate_config(text):
    config=json.loads(text)
    if type(config) is not dict or set(config)!={"mode","retries","tags"}:
        raise ValueError("unexpected structure")
    if config["mode"] not in ("offline","preview"):
        raise ValueError("unsupported mode")
    if type(config["retries"]) is not int or not 0<=config["retries"]<=3:
        raise ValueError("retry limit")
    tags=config["tags"]
    if (type(tags) is not list or len(tags)>5 or
        any(type(x) is not str or not 1<=len(x)<=12 for x in tags)
        or len(set(tags))!=len(tags)):
        raise ValueError("invalid or duplicate tags")
    return config
good='{"mode":"offline","retries":1,"tags":["math","code"]}'
assert validate_config(good)["tags"]==["math","code"]
for bad in ('{"mode":"unknown","retries":1,"tags":[]}',
            '{"mode":"offline","retries":true,"tags":[]}',
            '{"mode":"offline","retries":1,"tags":["x","x"]}',
            '{"mode":"offline","retries":1,"tags":[],"admin":true}'):
    try: validate_config(bad)
    except ValueError: pass
    else: raise AssertionError("invalid configuration accepted")
print("PASS strict configuration domain checks")
~~~

## Τεχνική εξήγηση
Η json.loads ελέγχει ότι το κείμενο είναι συντακτικά σωστό JSON, όχι ότι ακολουθεί το επιθυμητό μοντέλο. Στην Python η bool κληρονομεί από int, επομένως ο έλεγχος `type(x) is int` εμποδίζει την τιμή true του JSON να περάσει ως αριθμός. Η μοναδικότητα αποτρέπει διπλές ετικέτες και το μέγιστο μήκος περιορίζει την αύξηση μνήμης. Η επικύρωση δεδομένων δεν καθιστά αυτόματα ασφαλή τη χρήση τους μέσα σε SQL, HTML ή εντολές· κάθε προορισμός χρειάζεται δικούς του κανόνες.

## Περιορισμένες ασκήσεις
Δοκίμασε μηδέν και τρεις επαναλήψεις, κενή λίστα, έκτη ετικέτα, ετικέτα μεγαλύτερη από 12 χαρακτήρες και άγνωστη λειτουργία. Άλλαξε τη σειρά των ελέγχων χωρίς να επιτρέπονται διπλές ετικέτες. Πρόσθεσε έκδοση σχήματος και τεκμηριωμένη μετάβαση αντί να αποδέχεσαι αυθαίρετα παλιά πεδία. Μία αποτυχία δεν πρέπει να αποθηκεύει μερικές ρυθμίσεις.

## Διάγνωση και ασφάλεια
Όταν η ανάλυση JSON πετυχαίνει αλλά οι τιμές απορρίπτονται, δείξε τον κανόνα που απέτυχε χωρίς να καταγράφεις ιδιωτικές επιλογές. Για άγνωστα πεδία προτίμησε ρητή μετάβαση ή απόρριψη αντί για σιωπηλή μετατροπή. Οι προεπιλεγμένες τιμές πρέπει να είναι τεκμηριωμένες, όχι τυχαία υποκατάστατα λανθασμένων δεδομένων.
