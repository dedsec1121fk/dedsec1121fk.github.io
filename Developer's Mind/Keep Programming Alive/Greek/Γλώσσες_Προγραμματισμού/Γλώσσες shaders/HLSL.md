# hlsl — συγκεντρωτικός οδηγός

## HLSL

### Βασική ιδέα
Η HLSL περιγράφει shaders στο οικοσύστημα DirectX με stages, semantics και GPU resource κανόνες.

### Μικρό εκπαιδευτικό απόσπασμα
```text
float4 solid() : SV_Target {
  return float4(1, 0, 0, 1);
}
```

### Άσκηση βασισμένη στη συγκεκριμένη συμπεριφορά
Εξήγησε το SV_Target ως pixel output και άλλαξε χρώμα σε τοπικό shader sample.

### Διάγνωση και όρια
Μια συνάρτηση δεν αποτελεί ολόκληρο rendering pipeline· stage, shader model και bindings πρέπει να ταιριάζουν.

Κάνε την άσκηση με πραγματικά δοκιμαστικά δεδομένα και με έκδοση HLSL που ταιριάζει στον κώδικα. Σημείωσε μία αρχική πρόβλεψη και την πραγματική έξοδο. Για περίπλοκο ή μη διαθέσιμο runtime, παρουσίασε τη στατική ανάλυση ως τέτοια, όχι ως επιτυχημένη εκτέλεση. Δοκίμασε ξεχωριστά την κανονική περίπτωση και μία οριακή τιμή, χωρίς πραγματικά προσωπικά ή παραγωγικά δεδομένα.

## HLSL — Αναλυτικός οδηγός εξάσκησης

### Πραγματικό αρχικό δείγμα
~~~text
float4 main() : SV_Target { return float4(0.2, 0.5, 0.8, 1.0); }
~~~

**Περιβάλλον:** Compile as an HLSL pixel shader in an appropriate engine.. Επιβεβαίωσε ότι έχεις το σωστό compiler, host ή simulator πριν θεωρήσεις την έξοδο αξιόπιστη. Για scripts με πρόσβαση σε προσωπικά αρχεία ή ρυθμίσεις, χρησιμοποίησε προσωρινά και read-only δεδομένα.

### Συγκεκριμένος στόχος υλοποίησης
Γράψε pixel shader float4 από interpolated texture coordinates. Σύγκρινε SV_Position με TEXCOORD και έλεγξε UV εκτός εύρους.

### Κρίσιμο λάθος που πρέπει να αναγνωρίζεις
Shader model, matrix layout και registers εξαρτώνται από Direct3D pipeline. Compile success δεν εγγυάται σωστό binding.

## HLSL — Διαδρομή ουσιαστικής εξάσκησης

### Στόχος
Γράψε Direct3D pixel shader που μετατρέπει τις interpolated UV συντεταγμένες σε γκρι διαβάθμιση. Ξεχώρισε τα δεδομένα από το vertex stage, το αποτέλεσμα SV_Target0 και τα προβλήματα σύνδεσης resources. Απαιτούνται συμβατός HLSL compiler και Direct3D host· το αρχείο από μόνο του δεν εμφανίζει εικόνα.

### Pixel shader (Grayscale.hlsl)
~~~hlsl
struct PixelInput {
    float4 position : SV_POSITION;
    float2 uv       : TEXCOORD0;
};

float4 main(PixelInput input) : SV_Target0 {
    float2 uv = saturate(input.uv);
    float3 rgb = float3(uv.x, uv.y, 0.25);
    float gray = dot(rgb, float3(0.2126, 0.7152, 0.0722));
    return float4(gray, gray, gray, 1.0);
}
~~~

Οι συντελεστές προσεγγίζουν φωτεινότητα σε γραμμικό χρωματικό χώρο. Για εικόνα sRGB χρειάζονται σωστή αποκωδικοποίηση και έξοδος· ο παραπάνω υπολογισμός δεν είναι αυτόματα σωστό φωτογραφικό φίλτρο. Το SV_POSITION μεταφέρει στοιχεία rasterization, ενώ το TEXCOORD0 προέρχεται από παρεμβολή της εξόδου του vertex shader.

### Πειράματα που ξεχωρίζουν τα σφάλματα
1. Με UV (0,0) το αναμενόμενο γκρι είναι 0.01805. Με (1,1) είναι 0.94585· και στις δύο περιπτώσεις υπάρχει σταθερή μπλε συνιστώσα.
2. Με UV (-1,2), το saturate δίνει (0,1) και το γκρι αναμένεται 0.73325.
3. Άλλαξε TEXCOORD0 σε TEXCOORD1 μόνο στο pixel input. Σύγκρινε το diagnostic συμβατότητας των δύο σταδίων.
4. Δοκίμασε άκυρο output semantic και ξεχώρισε compiler error από έγκυρο shader χωρίς συνδεδεμένο render target.
5. Πρόσθεσε υφή με Texture2D/SamplerState και επιβεβαίωσε ότι ο host δένει τα ίδια slots που δηλώνει ο shader.

### Έλεγχος και μεταφερσιμότητα
Με DirectX Shader Compiler επέλεξε ρητά έκδοση compiler, entry main και στόχο όπως ps_6_0. Κράτησε log και δοκίμασε πραγματική σχεδίαση σε Direct3D με σωστές χρωματικές ρυθμίσεις. Η επιτυχία σε Windows δεν αποδεικνύει δυνατότητα εκτέλεσης σε Android/Termux. Χωρίς GPU host, δήλωσε το αποτέλεσμα μη επαληθευμένο.
