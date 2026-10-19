# Generated publication files / Παραγόμενα αρχεία δημοσίευσης

Build the current source with `python3 scripts/build_portable_site.py --target test --output .site-publish`. The output includes current sitemap, robots, LLM files and deployment manifest. Use `--target main` or `--target backup` with separate output directories to validate those profiles locally. This does not update their repositories.

Generated files are not maintained as stale duplicate snapshots in source control. Audit the actual build with `python3 scripts/audit_publication.py --output .site-publish`. See the English and Greek publication audit documentation for the complete scope.

Δημιουργήστε την τρέχουσα έκδοση με `python3 scripts/build_portable_site.py --target test --output .site-publish`. Το αποτέλεσμα περιλαμβάνει ενημερωμένο sitemap, robots, αρχεία LLM και στοιχεία ανάπτυξης. Οι επιλογές `--target main` και `--target backup`, σε ξεχωριστούς φακέλους, ελέγχουν τοπικά τα αντίστοιχα προφίλ χωρίς αλλαγή στα αποθετήριά τους.

Τα παραγόμενα αρχεία δεν διατηρούνται ως παρωχημένα διπλά στιγμιότυπα στον πηγαίο κώδικα. Ελέγξτε την πραγματική έξοδο με `python3 scripts/audit_publication.py --output .site-publish`. Η τεκμηρίωση ελέγχου δημοσίευσης διατίθεται στα αγγλικά και ελληνικά.
