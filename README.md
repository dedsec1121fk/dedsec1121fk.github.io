# DedSec Project — Official Website

<details>
<summary><strong>English</strong></summary>

This repository contains the bilingual DedSec Project website, its integrated TikDev page, the programming and troubleshooting knowledge library, and the tools that build and audit the site. This is the official production repository for [ded-sec.space](https://ded-sec.space/). The toolkit itself is maintained in the [DedSec repository](https://github.com/dedsec1121fk/DedSec).

<details><summary><strong>Files and folders explained</strong></summary>

| Path | What it contains and when to edit it |
| --- | --- |
| `index.html` | Published homepage for the live site. The editable homepage source lives in `DedSec-Project-Website/index.html`. |
| `DedSec-Project-Website/index.html` | Website homepage, navigation, footer and declarations for knowledge files loaded on demand. |
| `DedSec-Project-Website/assets/` | Shared themes, galaxy artwork, startup loader, homepage UI, Markdown renderer, full-site search, Copy/Back controls and cookie preferences. `page-controls.js` also supplies the translated website-repository footer link on subpages. |
| `DedSec-Project-Website/data/` | Deployable JavaScript lesson catalogues and enrichment records. `site-search.js` is the generated website-page search index; `tikdev-weekly.json` holds refreshed discovery data. These files are not all downloaded at startup. |
| `DedSec-Project-Website/dedsec/Pages/` | English project pages, including installation, tools, FAQ, privacy and contact. |
| `DedSec-Project-Website/dedsec/Assistance/` | English standalone troubleshooting guides. |
| `DedSec-Project-Website/dedsec/el/` | Greek counterparts of the project pages and Assistance guides. |
| `DedSec-Project-Website/dedsec/Assets/` | Imported project styles, scripts, logos and locally hosted font assets. |
| `DedSec-Project-Website/dedsec/Favicons/` | Browser icons. The adjacent `site.webmanifest` describes application icons and presentation. |
| `DedSec-Project-Website/dedsec/Other Files/`, `DedSec-Project-Website/dedsec/scripts/` | Supporting imported project files. Preserve their references when maintaining the project pages. |
| `DedSec-Project-Website/TikDev.html` | Integrated GitHub repository-discovery interface. Live discovery requires an Internet connection. |
| `DedSec-Project-Website/offline-worker.js` | Verifies and caches the basic DedSec startup bundle. It does not preload the entire knowledge archive. |
| `Developer's Mind/Keep Programming Alive/English/`, `Greek/` | Canonical bilingual lesson sources, examples and reference material. Keep source lessons and deployed catalogue records synchronized. |
| `Developer's Mind/` other files | Anonymous working-method material, English/Greek thinking profiles, the import manifest and maintainer contract. This is a transferable method library, not a personal biography. |
| `Documentation/English/`, `Documentation/Greek/` | Paired guides for human and AI maintainers: architecture, knowledge editing, themes, search, builds and publication audits. |
| `Documentation/RULES.md` | Required maintenance and editorial rules. Read before making changes. |
| `Documentation/*.json`, other review notes | Audit inventories, source hashes, executed-example evidence and recorded review limitations. A report describes its recorded run; current workflow results determine current release status. |
| `Deployment/README.md` | Explains generated publication files and the available deployment profiles. |
| `scripts/` | Search generation, catalogue and duplicate checks, example verification, unit tests, portable builds, publication audits and Chromium checks. Import/migration scripts are separate from normal builds. |
| `.github/workflows/` | Website validation and scheduled TikDev refresh automation. |
| `.gitignore`, `.nojekyll` | Git exclusions for generated/local files and the static-hosting marker. |
| `LICENSE` | Project ownership and usage terms. Component-specific notices remain relevant to the files they cover. |

</details>

<details><summary><strong>Run, build and generated files</strong></summary>

From the repository root, serve the local source and open `http://127.0.0.1:8765/DedSec-Project-Website/`:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Prepare and audit the production publication:

```sh
python3 -m pip install mistune==3.2.0
python3 scripts/build_site_search.py
python3 scripts/build_portable_site.py --target main --output .site-publish
python3 scripts/audit_publication.py --output .site-publish
```

The generated `.site-publish/` directory contains the deployable website, `learn/{en,el}/` article previews, linked raw sources, `sitemap.xml`, `robots.txt`, `llms.txt`, `llms-full.txt`, `deployment-manifest.json` and `startup-manifest.json`. The startup manifest selects only basic DedSec pages and their presentation dependencies; it is not a list of everything to download. Production allows indexing and uses `ded-sec.space` in `CNAME`, canonical URLs, sitemap and LLM references. The verified build is also committed at the repository root for the current static hosting setup, alongside the editable source folders. Rebuild and audit the root publication files together when releasing source changes. Building a profile locally does not publish it.

The loader prepares basic pages, images, themes and fonts. Knowledge databases and the full-site search index load when a topic, lesson or search requires them. Search returns complete matching passages, opens their destination and highlights the text. Quoted phrases, exclusions, OR, language/type/topic filters and title typo recovery are supported. Lessons provide Copy controls; themes and navigation work in both languages. Locally served complete downloads support offline reading; remote GitHub services require connectivity.

</details>

<details><summary><strong>Maintenance and verification</strong></summary>

Edit the existing canonical lesson before creating an overlapping topic. Preserve stable IDs, English/Greek parity, literal commands and source/catalogue agreement. Avoid duplicate lessons, repeated boilerplate and filler. Do not add personal conversations, credentials or private repository contents to Developer's Mind. Do not run `scripts/import_dedsec.py` as a routine build step: it can replace curated source files.

Run `python3 scripts/validate.py` and `python3 -m unittest discover -s scripts -p 'test_*.py'`. The repository workflow also runs knowledge/search audits, executable examples, build/link/SEO/LLM checks and Chromium checks in both themes. See [reader and search maintenance](Documentation/English/19_FIELD_NOTES_AND_READER.md) and [publication audit](Documentation/English/20_PUBLICATION_AUDIT.md). Check results for the exact commit being published; static checks do not certify every technical claim, device or external service.

</details>

</details>

<details>
<summary><strong>Ελληνικά</strong></summary>

Το αποθετήριο περιέχει τη δίγλωσση ιστοσελίδα DedSec Project, την ενσωματωμένη σελίδα TikDev, τη βιβλιοθήκη προγραμματισμού και αντιμετώπισης προβλημάτων, καθώς και τα εργαλεία δημιουργίας και ελέγχου. Είναι το επίσημο αποθετήριο παραγωγής του [ded-sec.space](https://ded-sec.space/). Τα ίδια τα εργαλεία διατηρούνται στο [αποθετήριο DedSec](https://github.com/dedsec1121fk/DedSec).

<details><summary><strong>Τι περιέχουν τα αρχεία και οι φάκελοι</strong></summary>

| Διαδρομή | Περιεχόμενο και χρήση |
| --- | --- |
| `index.html` | Δημοσιευμένη αρχική της ζωντανής ιστοσελίδας. Η επεξεργάσιμη πηγή της βρίσκεται στο `DedSec-Project-Website/index.html`. |
| `DedSec-Project-Website/index.html` | Αρχική ιστοσελίδας, πλοήγηση, υποσέλιδο και δηλώσεις αρχείων γνώσεων που φορτώνονται όταν χρειάζονται. |
| `DedSec-Project-Website/assets/` | Κοινά θέματα, γαλαξιακά γραφικά, οθόνη φόρτωσης, διεπαφή αρχικής, απόδοση Markdown, συνολική αναζήτηση, Αντιγραφή/Πίσω και προτιμήσεις cookies. Το `page-controls.js` προσθέτει και τον μεταφρασμένο σύνδεσμο αποθετηρίου ιστοσελίδας στα υποσέλιδα υποσελίδων. |
| `DedSec-Project-Website/data/` | Κατάλογοι μαθημάτων και επεκτάσεις σε JavaScript. Το `site-search.js` είναι το παραγόμενο ευρετήριο σελίδων και το `tikdev-weekly.json` περιέχει ανανεωμένα δεδομένα ανακάλυψης. Δεν κατεβαίνουν όλα στην εκκίνηση. |
| `DedSec-Project-Website/dedsec/Pages/` | Αγγλικές σελίδες έργου: εγκατάσταση, εργαλεία, συχνές ερωτήσεις, απόρρητο, επικοινωνία και άλλες πληροφορίες. |
| `DedSec-Project-Website/dedsec/Assistance/` | Αυτοτελείς αγγλικοί οδηγοί αντιμετώπισης προβλημάτων. |
| `DedSec-Project-Website/dedsec/el/` | Ελληνικές εκδόσεις των σελίδων έργου και των οδηγών Βοήθειας. |
| `DedSec-Project-Website/dedsec/Assets/` | Εισαγόμενα CSS, scripts, λογότυπα και τοπικά αρχεία γραμματοσειρών. |
| `DedSec-Project-Website/dedsec/Favicons/` | Εικονίδια προγράμματος περιήγησης. Το γειτονικό `site.webmanifest` περιγράφει εικονίδια εφαρμογής και εμφάνιση. |
| `DedSec-Project-Website/dedsec/Other Files/`, `DedSec-Project-Website/dedsec/scripts/` | Συνοδευτικά εισαγόμενα αρχεία έργου. Διατήρησε τις παραπομπές τους κατά τη συντήρηση σελίδων. |
| `DedSec-Project-Website/TikDev.html` | Ενσωματωμένη διεπαφή ανακάλυψης αποθετηρίων GitHub. Η ζωντανή ανακάλυψη απαιτεί Internet. |
| `DedSec-Project-Website/offline-worker.js` | Ελέγχει και αποθηκεύει το βασικό σύνολο εκκίνησης DedSec. Δεν προφορτώνει ολόκληρη τη βιβλιοθήκη γνώσεων. |
| `Developer's Mind/Keep Programming Alive/English/`, `Greek/` | Αυθεντικές δίγλωσσες πηγές μαθημάτων, παραδείγματα και υλικό αναφοράς. Διατήρησε συγχρονισμένα μαθήματα και δημοσιευμένους καταλόγους. |
| Υπόλοιπα αρχεία `Developer's Mind/` | Ανώνυμες μέθοδοι εργασίας, ελληνικά/αγγλικά προφίλ σκέψης, κατάλογος εισαγωγής και οδηγίες συντήρησης. Πρόκειται για μεταφέρσιμες μεθόδους, όχι προσωπική βιογραφία. |
| `Documentation/English/`, `Documentation/Greek/` | Αντίστοιχοι οδηγοί για ανθρώπους και AI: αρχιτεκτονική, συντήρηση γνώσεων, θέματα, αναζήτηση, δημιουργία και έλεγχος δημοσίευσης. |
| `Documentation/RULES.md` | Υποχρεωτικοί κανόνες συντήρησης και επιμέλειας. Διάβασέ τους πριν από αλλαγές. |
| `Documentation/*.json`, άλλες σημειώσεις ελέγχου | Κατάλογοι ελέγχων, hashes πηγών, αποδείξεις εκτέλεσης παραδειγμάτων και καταγεγραμμένοι περιορισμοί. Κάθε αναφορά αφορά τη δική της εκτέλεση· το τρέχον workflow δείχνει την κατάσταση της τρέχουσας έκδοσης. |
| `Deployment/README.md` | Εξηγεί τα παραγόμενα αρχεία δημοσίευσης και τα διαθέσιμα προφίλ. |
| `scripts/` | Δημιουργία αναζήτησης, έλεγχοι καταλόγων/διπλοτύπων, επαλήθευση παραδειγμάτων, δοκιμές, φορητά builds, έλεγχοι δημοσίευσης και Chromium. Οι μεταναστεύσεις/εισαγωγές δεν αποτελούν συνηθισμένο build. |
| `.github/workflows/` | Αυτοματισμοί ελέγχου ιστοσελίδας και προγραμματισμένης ανανέωσης TikDev. |
| `.gitignore`, `.nojekyll` | Εξαιρέσεις παραγόμενων/τοπικών αρχείων από το Git και ένδειξη στατικής φιλοξενίας. |
| `LICENSE` | Όροι κυριότητας και χρήσης έργου. Οι ειδικές γνωστοποιήσεις επιμέρους στοιχείων αφορούν τα αντίστοιχα αρχεία. |

</details>

<details><summary><strong>Τοπική λειτουργία, δημιουργία και παραγόμενα αρχεία</strong></summary>

Από τη ρίζα του αποθετηρίου εκτέλεσε τον τοπικό server και άνοιξε `http://127.0.0.1:8765/DedSec-Project-Website/`:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Δημιουργία και έλεγχος δημοσίευσης παραγωγής:

```sh
python3 -m pip install mistune==3.2.0
python3 scripts/build_site_search.py
python3 scripts/build_portable_site.py --target main --output .site-publish
python3 scripts/audit_publication.py --output .site-publish
```

Ο παραγόμενος φάκελος `.site-publish/` περιέχει τη δημοσιεύσιμη ιστοσελίδα, άρθρα `learn/{en,el}/`, συνδεδεμένες πηγές, `sitemap.xml`, `robots.txt`, `llms.txt`, `llms-full.txt`, `deployment-manifest.json` και `startup-manifest.json`. Το manifest εκκίνησης επιλέγει μόνο βασικές σελίδες DedSec και πόρους εμφάνισης· δεν αποτελεί λίστα για λήψη όλου του περιεχομένου. Η παραγωγή επιτρέπει ευρετηρίαση και χρησιμοποιεί `ded-sec.space` στο `CNAME`, στα κανονικά URLs, στο sitemap και στις παραπομπές LLM. Το ελεγμένο build αποθηκεύεται και στη ρίζα του αποθετηρίου για την τρέχουσα στατική φιλοξενία, μαζί με τους επεξεργάσιμους φακέλους πηγών. Σε νέα έκδοση αναδημιούργησε και έλεγξε μαζί τα δημοσιευμένα αρχεία ρίζας. Το τοπικό build δεν προκαλεί δημοσίευση.

Η φόρτωση προετοιμάζει βασικές σελίδες, εικόνες, θέματα και γραμματοσειρές. Οι βάσεις γνώσεων και το ευρετήριο συνολικής αναζήτησης φορτώνονται όταν ανοίξεις θέμα, μάθημα ή χρησιμοποιήσεις αναζήτηση. Τα αποτελέσματα δείχνουν πλήρη σχετικά αποσπάσματα, ανοίγουν τον προορισμό και επισημαίνουν το κείμενο. Υποστηρίζονται φράσεις σε εισαγωγικά, εξαιρέσεις, OR, φίλτρα γλώσσας/τύπου/θέματος και μικρά λάθη τίτλων. Τα μαθήματα διαθέτουν Αντιγραφή· θέματα και πλοήγηση λειτουργούν και στις δύο γλώσσες. Πλήρες πακέτο μέσω τοπικού server επιτρέπει ανάγνωση εκτός σύνδεσης· οι απομακρυσμένες υπηρεσίες GitHub απαιτούν σύνδεση.

</details>

<details><summary><strong>Συντήρηση και επαλήθευση</strong></summary>

Επέκτεινε το υπάρχον αυθεντικό μάθημα πριν δημιουργήσεις παρόμοιο θέμα. Διατήρησε μοναδικά ID, ισοδύναμο αγγλικό/ελληνικό περιεχόμενο, ακριβείς εντολές και συμφωνία πηγών/καταλόγου. Απόφυγε διπλότυπα, επαναλαμβανόμενα γενικόλογα κείμενα και περιττό υλικό. Μην εισάγεις προσωπικές συνομιλίες, μυστικά ή ιδιωτικό κώδικα στο Developer's Mind. Μην εκτελείς το `scripts/import_dedsec.py` σε συνηθισμένο build: μπορεί να αντικαταστήσει επιμελημένες πηγές.

Εκτέλεσε `python3 scripts/validate.py` και `python3 -m unittest discover -s scripts -p 'test_*.py'`. Το workflow ελέγχει επίσης γνώση/αναζήτηση, εκτελέσιμα παραδείγματα, builds, συνδέσμους, SEO/LLM και Chromium στα δύο θέματα. Δες [συντήρηση ανάγνωσης και αναζήτησης](Documentation/Greek/19_ΤΕΧΝΙΚΕΣ_ΣΗΜΕΙΩΣΕΙΣ_ΚΑΙ_ΠΛΟΗΓΗΣΗ.md) και [έλεγχο δημοσίευσης](Documentation/Greek/20_ΕΛΕΓΧΟΣ_ΔΗΜΟΣΙΕΥΣΗΣ.md). Εξέτασε τα αποτελέσματα του συγκεκριμένου commit που δημοσιεύεται· οι στατικοί έλεγχοι δεν πιστοποιούν κάθε τεχνικό ισχυρισμό, συσκευή ή εξωτερική υπηρεσία.

</details>

</details>
