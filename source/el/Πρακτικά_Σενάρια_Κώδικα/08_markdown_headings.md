# Εξαγωγή Markdown headings με αγνόηση code fences

## Προστέθηκε το αρχείο που έλειπε
Το 08_markdown_headings.py υλοποιεί περιορισμένο scanner για ATX headings. Αναγνωρίζει levels 1 έως 6 με μέχρι τρία αρχικά κενά, αγνοεί headings σε fenced code, αφαιρεί τελικά διακοσμητικά hashes και δημιουργεί μοναδικά anchors για επαναλαμβανόμενους τίτλους. Τα ελληνικά Unicode γράμματα διατηρούνται. Δεν είναι πλήρης CommonMark parser ούτε μιμείται ακριβώς τα GitHub slugs.

## Εκτέλεση
Τρέξε python 08_markdown_headings.py. Το fixture έχει δύο Intro headings, μία γραμμή code fence με # που δεν πρέπει να καταγραφεί, ελληνικό τίτλο και escaped #. Περιμένεις anchors intro, ελληνικά και intro-1. Ελέγχεται επίσης indented code line και προαιρετικό closing hash.

## Απλούστερη υλοποίηση για μελέτη
~~~python
import re
def simple_headings(text):
    result = []
    inside = False
    for line in text.splitlines():
        if line.startswith("~~~"):
            inside = not inside
            continue
        if not inside:
            match = re.match(r"^#{1,6}\s+(.+)$", line)
            if match:
                result.append(match.group(1))
    return result
~~~

Αυτό το μικρό fragment δείχνει το state ενός fence. Το πραγματικό script προσθέτει indentation, δύο τύπους fences, Unicode slugs, αριθμούς γραμμών και collision handling. Μη χρησιμοποιείς το απλό παράδειγμα ως πλήρη parser.

## Δοκιμές επέκτασης
Πρόσθεσε fence τεσσάρων backticks που περιέχει γραμμή τριών, σύγκρινε GitHub anchors σε τίτλους με punctuation και αποφάσισε αν θα υποστηρίξεις Setext, inline links και HTML. Πρόσθεσε test για κάθε δυνατότητα. Η πλήρης CommonMark έχει περισσότερους κανόνες. Κώδικας: 08_markdown_headings.py. Πηγή: https://spec.commonmark.org/
