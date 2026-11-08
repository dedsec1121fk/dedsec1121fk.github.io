# DedSec Launcher — public update feed

This public directory is the **anonymous read-only update channel** for the private-source DedSec Android Launcher.

- `stable.json` is the current stable version manifest. It is **deliberately `available: false`** until a real, verified, persistently signed APK is published.
- Releases are large full **Offline Launcher** APKs, including all eight bundled DedSec app installers.
- The Android launcher checks this feed near local midnight (subject to Android battery scheduling), queues a newer verified APK through DownloadManager, and asks before installation.
- Every update manifest includes `versionCode`, `versionName`, a public GitHub Release `apkUrl`, `apkBytes`, `apkSha256`, `publishedAt`, and English/Greek change lists. Clients validate the download hash and verify that the signing certificate matches the installed launcher.
- The trusted `apkUrl` prefix is `https://github.com/dedsec1121fk/dedsec1121fk.github.io/releases/download/`. The private `dedsec1121fk/Android-Apps` repository is not directly readable by unauthenticated phones.

## Publishing

The source/build repository contains a **manual-only** GitHub Actions workflow `.github/workflows/publish-dedsec-launcher-update.yml`. After stable Android signing secrets and the public-repo release token have been configured, this workflow builds the Offline release, verifies it, uploads it to public GitHub Releases, and *then* updates `stable.json` on this repository's `main` branch. Never publish a manifest that points to a missing asset.

Do **not** embed a GitHub personal access token in any APK. Do **not** publish ephemeral Actions debug builds as stable releases: their signing certificates can change and they cannot reliably update in place.

---

# Ελληνικά

Αυτός ο δημόσιος φάκελος είναι το **κανάλι ενημερώσεων του DedSec Launcher** που διαβάζεται από Android χωρίς token. Το `stable.json` ξεκινά με `available: false` μέχρι να δημοσιευτεί πραγματικό APK με **μόνιμη υπογραφή παραγωγής**.

Οι ενημερώσεις προορίζονται για την πλήρη **Offline έκδοση** με τα 8 ενσωματωμένα APK. Η συσκευή προγραμματίζει έλεγχο κοντά στις 00:00 τοπική ώρα (το Android μπορεί να τον καθυστερήσει), κατεβάζει έγκυρο νεότερο APK και προτείνει την εγκατάστασή του μόνο μετά από έλεγχο hash, έκδοσης, πακέτου και ίδιας υπογραφής.

Η δημοσίευση γίνεται **μόνο χειροκίνητα** από το ιδιωτικό αποθετήριο `Android-Apps`, με μόνιμο keystore και εξουσιοδοτημένο token για αυτό το δημόσιο repository. Δεν ενσωματώνουμε μυστικά ή token στην εφαρμογή Android.
