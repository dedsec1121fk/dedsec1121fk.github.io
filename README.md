<div align="center">
  <img src="Favicons/favicon-512.png" alt="DedSec Project logo" width="160">

  # DedSec Project — Official Website

  **Cybersecurity education · Developer tools · Digital independence**

  **Established October 20, 2024 · English / Ελληνικά**

  [Website](https://ded-sec.space/) · [Ελληνική Ιστοσελίδα](https://ded-sec.space/el/) · [Main Project Repository](https://github.com/dedsec1121fk/DedSec)
</div>

---

**Choose your language / Επιλέξτε γλώσσα:** [🇬🇧 English](#english-readme) · [🇬🇷 Ελληνικά](#greek-readme)

<a id="english-readme"></a>

# 🇬🇧 English

> **Ελληνικά:** [Μετάβαση στην ελληνική ενότητα](#greek-readme).
>
> Each section below is expandable and **closed by default**. Tap a title to read more.

<details>
<summary><strong>About this Website & the DedSec Project</strong></summary>

The **DedSec Project** was established on **October 20, 2024**, by **[dedsec1121fk](https://github.com/dedsec1121fk)**. This repository contains the project's **official website**, including guides, resources, tool descriptions, assistance pages, and its founder's story. The software itself is maintained in the separate [DedSec repository](https://github.com/dedsec1121fk/DedSec).

The website offers both **English and Greek** pages to help visitors learn, troubleshoot, and discover the project's work. Its focus is on useful technical knowledge, responsible cybersecurity education, and making digital tools easier to understand.

</details>

<details>
<summary><strong>History, Vision & Today's Digital World</strong></summary>

The project began on **October 20, 2024** with an interest in accessible technology, self-learning, and practical digital skills.

Its founder's story also explores difficult questions about a rapidly changing world: how increasingly powerful technology can be misused for surveillance, manipulation, and cybercrime; how economic pressure and inequality can leave people behind; how corruption can weaken trust in institutions; and what people might lose if physical cash becomes less available as payments move online.

These are **concerns and questions**, not a claim that every government is corrupt or that cash is certain to disappear. The project's response is to encourage education, privacy awareness, critical thinking, and responsible use of technology.

Read more in [Founder's Story & Project's Vision](https://ded-sec.space/Pages/about-founder.html).

</details>

<details>
<summary><strong>Supported Platforms</strong></summary>

The website documents installation and operation of the **main DedSec toolkit** on:

- **Android** using **Termux**
- **Ubuntu**
- **Kali Linux**
- **Linux Mint**

Platform support applies to the main project workflow; **individual tools may be platform-specific**. Android/Termux utilities are not automatically available on desktop Linux, and standalone Android APKs are listed separately on the website where available.

See the [installation guide](https://ded-sec.space/Pages/guide-for-installation.html) for platform-specific requirements and instructions.

</details>

<details>
<summary><strong>Installation & Starting the Toolkit</strong></summary>

The website itself is browsed online and does **not** require installing the toolkit. To install the main DedSec toolkit, use a supported environment and follow its installation guide.

```bash
git clone https://github.com/dedsec1121fk/DedSec.git
cd DedSec
bash Setup.sh
./Run.sh
```

On supported desktop Linux distributions, setup uses system packages together with a project-local `.venv` and `Compat/bin`. On Android, Termux uses its own packages and Android-aware storage paths. Follow the project prompts; dependencies and specific features vary by platform.

**Already installed?** Follow the update instructions in the [installation guide](https://ded-sec.space/Pages/guide-for-installation.html) rather than cloning another copy into your existing project folder.

</details>

<details>
<summary><strong>Website Sections & Features</strong></summary>

- [Home](https://ded-sec.space/) — introduction, project information and links.
- [Installation Guide](https://ded-sec.space/Pages/guide-for-installation.html) — supported systems and step-by-step setup.
- [Learn About the Tools](https://ded-sec.space/Pages/learn-about-the-tools.html) — descriptions, platform notes, and output paths.
- [Assistance](https://ded-sec.space/Pages/assistance.html) — common problems, compatibility notes, and help.
- [Frequently Asked Questions](https://ded-sec.space/Pages/faq.html) — answers to recurring questions.
- [Founder's Story & Vision](https://ded-sec.space/Pages/about-founder.html) — history, motivations, and project direction.
- [Contact & Credits](https://ded-sec.space/Pages/contact-credits.html) — contact options and contributor recognition.
- [Privacy Policy](https://ded-sec.space/Pages/privacy-policy.html) — website privacy information.

The site has corresponding Greek pages at [ded-sec.space/el/](https://ded-sec.space/el/). The tool index also documents the `APK's` collection and the available ButSystem Android build.

</details>

<details>
<summary><strong>File Locations & Platform Differences</strong></summary>

- **Android / Termux:** downloaded output commonly goes to `~/storage/downloads/` or Android's shared Downloads directory, when storage access is configured.
- **Ubuntu / Kali Linux / Linux Mint:** downloaded output commonly goes to `~/Downloads/` or the configured XDG Downloads directory.
- **Desktop Python environment:** `DedSec/.venv/`.
- **Desktop compatibility commands:** `DedSec/Compat/bin/`.
- **Shell startup files:** Termux commonly uses `$PREFIX/etc/bash.bashrc`; Ubuntu and Linux Mint often use `~/.bashrc`; Kali can use `~/.zshrc`, depending on the selected shell.

These are typical defaults, **not guaranteed paths** on every device. Some tools have their own output directories; check their individual descriptions.

</details>

<details>
<summary><strong>Safety, Permissions & Responsible Use</strong></summary>

The site's cybersecurity material is intended for learning, defensive research, and controlled demonstrations. Only test systems and accounts you own or have explicit authorization to assess. Respect applicable laws, other people's privacy, and the terms of third-party services.

Individual tools may have different requirements, limitations, or risks. Read their descriptions and instructions before use.

</details>

<details>
<summary><strong>Official Links & Maintenance</strong></summary>

- **Main website:** https://ded-sec.space/
- **Greek website:** https://ded-sec.space/el/
- **Website source repository:** https://github.com/dedsec1121fk/dedsec1121fk.github.io
- **Main toolkit repository:** https://github.com/dedsec1121fk/DedSec
- **Backup toolkit repository:** https://github.com/sal-scar/DedSec
- **Backup website:** https://ded-sec.online/

**For maintainers:** This repository contains website files; the toolkit source belongs in the main DedSec repository. Keep English and Greek pages in sync, ensure links point to existing pages, and check platform-specific statements before publishing.

</details>

<details>
<summary><strong>Credits</strong></summary>

These credits match the project's [Contact & Credits](https://ded-sec.space/Pages/contact-credits.html) page:

- **Creator:** dedsec1121fk
- **Help By:** zyxen.gr Systems Engineered
- **Art Artists:** Christina Chatzidimitriou, 3A
- **Legal Documents:** Lampros Spyrou
- **Discord Server Maintenance:** Talha
- **Past Help:** Sal Scar, gr3ysec, lamprouil, UKI_hunter

Recognition appears here and on the dedicated Credits page, rather than being repeated as a technical-helper footer on every page.

</details>

---

<a id="greek-readme"></a>

# 🇬🇷 Ελληνικά

> **English:** [Go to the English section](#english-readme).
>
> Όλες οι παρακάτω ενότητες είναι **κλειστές από προεπιλογή**. Πάτησε τον τίτλο μιας ενότητας για να εμφανιστεί το περιεχόμενό της.

<details>
<summary><strong>Σχετικά με την Ιστοσελίδα και το DedSec Project</strong></summary>

Το **DedSec Project** δημιουργήθηκε στις **20 Οκτωβρίου 2024** από τον **[dedsec1121fk](https://github.com/dedsec1121fk)**. Αυτό το αποθετήριο περιέχει την **επίσημη ιστοσελίδα** του project, με οδηγούς, πόρους, περιγραφές εργαλείων, σελίδες βοήθειας και την ιστορία του ιδρυτή. Ο κώδικας του ίδιου του toolkit βρίσκεται στο ξεχωριστό [αποθετήριο DedSec](https://github.com/dedsec1121fk/DedSec).

Η ιστοσελίδα διαθέτει περιεχόμενο στα **Ελληνικά και στα Αγγλικά**, ώστε οι επισκέπτες να μπορούν να ενημερώνονται, να επιλύουν προβλήματα και να ανακαλύπτουν το έργο του project. Στόχος είναι η πρόσβαση σε χρήσιμες τεχνικές γνώσεις, η υπεύθυνη εκπαίδευση στην κυβερνοασφάλεια και η καλύτερη κατανόηση της τεχνολογίας.

</details>

<details>
<summary><strong>Ιστορία, Όραμα και ο Σύγχρονος Ψηφιακός Κόσμος</strong></summary>

Το project ξεκίνησε στις **20 Οκτωβρίου 2024**, με επίκεντρο την προσβάσιμη τεχνολογία, την αυτοεκπαίδευση και τις πρακτικές ψηφιακές δεξιότητες.

Η ιστορία του ιδρυτή εξετάζει επίσης δύσκολα ερωτήματα για έναν κόσμο που αλλάζει γρήγορα: πώς η ολοένα ισχυρότερη τεχνολογία μπορεί να χρησιμοποιηθεί για παρακολούθηση, χειραγώγηση και κυβερνοέγκλημα· πώς οι οικονομικές πιέσεις και οι ανισότητες μπορούν να αφήσουν ανθρώπους πίσω· πώς η διαφθορά μπορεί να υπονομεύσει την εμπιστοσύνη στους θεσμούς· και τι μπορεί να χαθεί εάν περιοριστεί η χρήση φυσικών μετρητών καθώς οι πληρωμές γίνονται όλο και πιο ψηφιακές.

Πρόκειται για **προβληματισμούς και ερωτήματα** — όχι για ισχυρισμό ότι όλες οι κυβερνήσεις είναι διεφθαρμένες ή ότι τα μετρητά θα εξαφανιστούν οπωσδήποτε. Η απάντηση που προτείνει το project είναι η εκπαίδευση, η προστασία της ιδιωτικότητας, η κριτική σκέψη και η υπεύθυνη χρήση της τεχνολογίας.

Περισσότερα στην [Ιστορία του Ιδρυτή και το Όραμα του Project](https://ded-sec.space/el/Pages/about-founder.html).

</details>

<details>
<summary><strong>Υποστηριζόμενες Πλατφόρμες</strong></summary>

Η ιστοσελίδα παρέχει οδηγίες εγκατάστασης και χρήσης του **βασικού DedSec toolkit** για:

- **Android** μέσω **Termux**
- **Ubuntu**
- **Kali Linux**
- **Linux Mint**

Η υποστήριξη αφορά τη βασική λειτουργία του project· **ορισμένα εργαλεία λειτουργούν μόνο σε συγκεκριμένες πλατφόρμες**. Οι λειτουργίες του Android/Termux δεν είναι απαραίτητα διαθέσιμες σε desktop Linux, ενώ τα αυτόνομα Android APK εμφανίζονται ξεχωριστά, όπου υπάρχουν.

Δες τον [Οδηγό Εγκατάστασης](https://ded-sec.space/el/Pages/guide-for-installation.html) για απαιτήσεις και αναλυτικές οδηγίες ανά πλατφόρμα.

</details>

<details>
<summary><strong>Εγκατάσταση και Εκκίνηση του Toolkit</strong></summary>

Η ίδια η ιστοσελίδα λειτουργεί online και **δεν** απαιτεί εγκατάσταση του toolkit. Για να εγκαταστήσεις το βασικό DedSec toolkit, χρησιμοποίησε ένα υποστηριζόμενο περιβάλλον και ακολούθησε τον οδηγό εγκατάστασης.

```bash
git clone https://github.com/dedsec1121fk/DedSec.git
cd DedSec
bash Setup.sh
./Run.sh
```

Στις υποστηριζόμενες διανομές desktop Linux, η εγκατάσταση χρησιμοποιεί πακέτα συστήματος, το τοπικό περιβάλλον Python `.venv` και το `Compat/bin`. Στο Android, το Termux χρησιμοποιεί δικά του πακέτα και διαδρομές αποθήκευσης προσαρμοσμένες στο Android. Ακολούθησε τα μηνύματα του project, καθώς οι εξαρτήσεις και οι δυνατότητες διαφέρουν ανά σύστημα.

**Έχεις ήδη κάνει εγκατάσταση;** Ακολούθησε τις οδηγίες ενημέρωσης στον [Οδηγό Εγκατάστασης](https://ded-sec.space/el/Pages/guide-for-installation.html), αντί να δημιουργήσεις δεύτερο αντίγραφο στον ίδιο φάκελο.

</details>

<details>
<summary><strong>Σελίδες και Δυνατότητες της Ιστοσελίδας</strong></summary>

- [Αρχική](https://ded-sec.space/el/) — παρουσίαση, πληροφορίες και βασικοί σύνδεσμοι.
- [Οδηγός Εγκατάστασης](https://ded-sec.space/el/Pages/guide-for-installation.html) — υποστηριζόμενα συστήματα και οδηγίες.
- [Μάθε για τα Εργαλεία](https://ded-sec.space/el/Pages/learn-about-the-tools.html) — περιγραφές, πληροφορίες συμβατότητας και διαδρομές αποθήκευσης.
- [Βοήθεια](https://ded-sec.space/el/Pages/assistance.html) — συχνά προβλήματα και τρόποι αντιμετώπισης.
- [Συχνές Ερωτήσεις](https://ded-sec.space/el/Pages/faq.html) — απαντήσεις σε συνηθισμένες απορίες.
- [Ιστορία Ιδρυτή και Όραμα](https://ded-sec.space/el/Pages/about-founder.html) — ιστορία, κίνητρα και στόχοι.
- [Επικοινωνία και Συντελεστές](https://ded-sec.space/el/Pages/contact-credits.html) — τρόποι επικοινωνίας και αναγνώριση συντελεστών.
- [Πολιτική Απορρήτου](https://ded-sec.space/el/Pages/privacy-policy.html) — πληροφορίες για το απόρρητο της ιστοσελίδας.

Οι αντίστοιχες αγγλικές σελίδες βρίσκονται στο [ded-sec.space](https://ded-sec.space/). Στη λίστα εργαλείων περιγράφεται επίσης η συλλογή `APK's` και η διαθέσιμη έκδοση του ButSystem για Android.

</details>

<details>
<summary><strong>Διαδρομές Αρχείων και Διαφορές Πλατφορμών</strong></summary>

- **Android / Termux:** τα αρχεία αποθηκεύονται συνήθως στο `~/storage/downloads/` ή στον κοινόχρηστο φάκελο Downloads του Android, εφόσον έχει δοθεί πρόσβαση.
- **Ubuntu / Kali Linux / Linux Mint:** συνήθως στο `~/Downloads/` ή στη ρυθμισμένη διαδρομή XDG Downloads.
- **Περιβάλλον Python σε desktop:** `DedSec/.venv/`.
- **Εντολές συμβατότητας σε desktop:** `DedSec/Compat/bin/`.
- **Αρχεία εκκίνησης shell:** στο Termux συνήθως `$PREFIX/etc/bash.bashrc`, σε Ubuntu/Linux Mint συχνά `~/.bashrc`, ενώ στο Kali μπορεί να χρησιμοποιείται `~/.zshrc`, ανάλογα με το shell.

Οι παραπάνω διαδρομές είναι **συνηθισμένες**, όχι εγγυημένες σε κάθε συσκευή. Ορισμένα εργαλεία έχουν δικούς τους φακέλους εξόδου· έλεγξε τις επιμέρους περιγραφές τους.

</details>

<details>
<summary><strong>Ασφάλεια, Άδειες και Υπεύθυνη Χρήση</strong></summary>

Το περιεχόμενο κυβερνοασφάλειας της ιστοσελίδας προορίζεται για μάθηση, αμυντική έρευνα και ελεγχόμενες δοκιμές. Πραγματοποίησε ελέγχους μόνο σε συστήματα ή λογαριασμούς που σου ανήκουν ή για τα οποία έχεις ρητή άδεια. Σεβάσου τη νομοθεσία, την ιδιωτικότητα των άλλων και τους όρους των υπηρεσιών τρίτων.

Κάθε εργαλείο μπορεί να έχει διαφορετικές απαιτήσεις, περιορισμούς ή κινδύνους. Διάβασε τις περιγραφές και τις οδηγίες του πριν από τη χρήση.

</details>

<details>
<summary><strong>Επίσημοι Σύνδεσμοι και Συντήρηση</strong></summary>

- **Κύρια ιστοσελίδα:** https://ded-sec.space/
- **Ελληνική ιστοσελίδα:** https://ded-sec.space/el/
- **Αποθετήριο ιστοσελίδας:** https://github.com/dedsec1121fk/dedsec1121fk.github.io
- **Κύριο αποθετήριο toolkit:** https://github.com/dedsec1121fk/DedSec
- **Εφεδρικό αποθετήριο toolkit:** https://github.com/sal-scar/DedSec
- **Εφεδρική ιστοσελίδα:** https://ded-sec.online/

**Για όσους συντηρούν το project:** Αυτό το αποθετήριο περιέχει τα αρχεία της ιστοσελίδας· ο κώδικας του toolkit βρίσκεται στο κύριο αποθετήριο DedSec. Κράτησε τις ελληνικές και αγγλικές σελίδες συγχρονισμένες, έλεγχε ότι οι σύνδεσμοι αντιστοιχούν σε υπαρκτές σελίδες και επιβεβαίωνε τις πληροφορίες συμβατότητας πριν από τη δημοσίευση.

</details>

<details>
<summary><strong>Συντελεστές</strong></summary>

Οι παρακάτω συντελεστές αναφέρονται στη σελίδα [Επικοινωνία & Συντελεστές](https://ded-sec.space/el/Pages/contact-credits.html) του project:

- **Δημιουργός:** dedsec1121fk
- **Βοήθεια από:** zyxen.gr Systems Engineered
- **Καλλιτέχνες:** Christina Chatzidimitriou, 3A
- **Νομικά Έγγραφα:** Lampros Spyrou
- **Συντήρηση Discord Server:** Talha
- **Προηγούμενη Βοήθεια:** Sal Scar, gr3ysec, lamprouil, UKI_hunter

Οι αναφορές εμφανίζονται εδώ και στην ειδική σελίδα Συντελεστών, χωρίς να επαναλαμβάνεται η τεχνική βοήθεια στο υποσέλιδο κάθε σελίδας.

</details>

---

<div align="center">
  <sub>© 2024–2026 DedSec Project · Website maintained by dedsec1121fk</sub>
</div>
