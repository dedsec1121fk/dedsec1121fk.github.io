# PCAP headers: επαλήθευση metadata πριν από ερμηνεία πακέτων

## Μοντέλο και όρια συμπερασμάτων
Ένα packet capture περιέχει παρατηρημένη κίνηση δικτύου και όχι πάντα πλήρη application messages. Η αρχική επικεφαλίδα PCAP περιγράφει byte order, ακρίβεια timestamp, snaplen και τύπο link layer. Ελλιπή ή άκυρα record lengths παραπλανούν την ανάλυση. Κατέγραψε μόνο εξουσιοδοτημένη κίνηση και απέκρυψε payloads/αναγνωριστικά.

## Αυτοτελές δοκιμαστικό δείγμα
~~~python
import struct
# Synthetic classic PCAP, little-endian, Ethernet link type (1), no packets.
header = struct.pack("<IHHIIII",
    0xa1b2c3d4, 2, 4, 0, 0, 65535, 1)
assert len(header) == 24
magic = header[:4].hex()
major, minor = struct.unpack_from("<HH", header, 4)
snaplen = struct.unpack_from("<I", header, 16)[0]
linktype = struct.unpack_from("<I", header, 20)[0]
assert (major, minor, snaplen, linktype) == (2, 4, 65535, 1)
print("magic:", magic, "linktype:", linktype)
~~~

## Βήματα έρευνας και ελέγχου
Ξεχώρισε classic PCAP από PCAPNG, γιατί έχουν διαφορετικές δομές. Έλεγξε magic και endianness, κατόπιν record boundaries και captured_length <= original_length. Ερμήνευσε Ethernet/IP/TCP μόνο όταν το linktype και τα διαθέσιμα bytes το επιτρέπουν. Σε κρυπτογραφημένη κίνηση τα timings δεν αποδεικνύουν περιεχόμενο μηνυμάτων.

## Πρακτικό εργαστήριο
Πρόσθεσε ένα συνθετικό packet record τεσσάρων bytes, διάβασε timestamps και captured/original lengths και επαλήθευσε offsets. Άλλαξε το δηλωμένο captured length ώστε να ξεπερνά το αρχείο και απόρριψέ το πριν από decoding.

## Πρώτα επαλήθευση ορίου, μετά ερμηνεία packet
Στο κλασικό PCAP, μετά το global header των 24 bytes, κάθε record περιλαμβάνει τέσσερα πεδία 32-bit: timestamp seconds, κλασματικό χρόνο, captured length και original length, όλα με το byte order που δηλώνει η αρχή του αρχείου. Φτιάξε συνθετικό packet με τέσσερα ακίνδυνα bytes και captured length `4`. Έπειτα δήλωσε μήκος `8` χωρίς να προσθέσεις bytes: ο parser πρέπει να απορρίψει το record προτού επιχειρήσει να διαβάσει payload. Μην υποθέτεις ότι όλα τα TCP μηνύματα είναι πλήρη ή ότι ο χρόνος έχει πάντα μονάδα nanoseconds· το magic number καθορίζει και την ακρίβεια.
