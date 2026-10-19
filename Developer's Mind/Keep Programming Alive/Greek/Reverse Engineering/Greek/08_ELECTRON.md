# Όρια διεργασιών Electron

## Βασική έννοια

Το Electron περιλαμβάνει main process, renderer, πιθανό preload και assets. Το ASAR είναι container, όχι υποχρεωτικά κρυπτογράφηση. Η παρουσία αρχείου δεν σημαίνει εκτέλεση.

## Χωρίς AI: πράξη

Εξέτασε δικό σου Electron demo. Σχεδίασε file access στο main, UI ενημερώσεις στο renderer και όρια IPC ή preload.

## Επαλήθευση

Βρες ένα resource που υπάρχει στο πακέτο αλλά δεν ενεργοποιείται από τη δοκιμασμένη αλληλεπίδραση.

## Προαιρετικά με AI

Ζήτησε από AI έλεγχο διαγράμματος με απαίτηση τεκμηρίου για κάθε σύνδεση.

## Πρακτικό εργαστήριο: όριο προνομίων Electron

Το Electron διαχωρίζει τον browser renderer από την ισχυρότερη main process. Ένα κουμπί στον renderer δεν πρέπει να αποκτά απεριόριστη πρόσβαση σε Node.js. Αναλύουμε μόνο δική μας ή εξουσιοδοτημένη εφαρμογή.

Φτιάξε δοκιμαστικό παράθυρο με ενεργό context isolation και απενεργοποιημένο Node integration. Το preload εκθέτει μία μόνο δυνατότητα αντί για πλήρες ipcRenderer. Στη main process καταχώρισε έναν συγκεκριμένο handler που επιστρέφει σταθερό δοκιμαστικό όνομα.

~~~javascript
// preload.js
const {contextBridge, ipcRenderer} = require('electron');
contextBridge.exposeInMainWorld('demoAPI', {
  readDemoName: () => ipcRenderer.invoke('demo:filename')
});
// main process: handler αφού εισαχθεί το ipcMain
ipcMain.handle('demo:filename', () => 'fixture.txt');
~~~

Χαρτογράφησε DOM -> preload -> συγκεκριμένο IPC channel -> main handler -> απάντηση. Σημείωσε ποιο τμήμα μπορεί να διαβάσει δίσκο, ποια δεδομένα περνούν το όριο και πού ελέγχονται είσοδοι. Άλλαξε το channel σε demo:missing: πρέπει να αποτύχει χωρίς πρόσβαση σε γενικό μηχανισμό αρχείων. Επανέφερε το όνομα και επιβεβαίωσε την απάντηση fixture.txt.

Παρατήρηση UI, IPC και μελέτη πηγαίου κώδικα δεν αποδεικνύουν το ίδιο πράγμα. Η απενεργοποίηση DevTools δεν υποκαθιστά περιορισμένα προνόμια. Πηγή: https://www.electronjs.org/docs/latest/tutorial/security.
