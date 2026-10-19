# wgsl — συγκεντρωτικός οδηγός

## WGSL

**Συνήθης χρήση:** Γλώσσες shaders.

**Προτεινόμενη επέκταση αρχείου:** `.wgsl`.

**Εκτέλεση / περιβάλλον:** Χρησιμοποίησέ το σε περιβάλλον WebGPU με render pipeline.

### Αρχικό παράδειγμα

```
@fragment
fn main() -> @location(0) vec4f {
  return vec4f(0.2, 0.5, 0.8, 1.0);
}
```

### Πώς διαβάζεται

Οι shaders WebGPU χρειάζονται ρυθμίσεις σύνδεσης και pipeline.

### Συνηθισμένο λάθος

Οι shaders WebGPU χρειάζονται ρυθμίσεις σύνδεσης και pipeline. Έλεγξε την έκδοση διερμηνευτή/μεταγλωττιστή και μην εκλαμβάνεις το δείγμα ως έτοιμη εφαρμογή παραγωγής.

## WGSL — Αναλυτικός οδηγός εξάσκησης

### Πραγματικό αρχικό δείγμα
~~~text
@fragment
fn main() -> @location(0) vec4f {
  return vec4f(0.2, 0.5, 0.8, 1.0);
}
~~~

**Περιβάλλον:** Use in a WebGPU host with a render pipeline.. Επιβεβαίωσε ότι έχεις το σωστό compiler, host ή simulator πριν θεωρήσεις την έξοδο αξιόπιστη. Για scripts με πρόσβαση σε προσωπικά αρχεία ή ρυθμίσεις, χρησιμοποίησε προσωρινά και read-only δεδομένα.

### Συγκεκριμένος στόχος υλοποίησης
Φτιάξε @fragment function που επιστρέφει @location(0) vec4f από UV. Έλεγξε clamp και binding groups με WebGPU host.

### Κρίσιμο λάθος που πρέπει να αναγνωρίζεις
Η WGSL έχει ρητά address spaces και validation· συσκευή/browser μπορεί να απορρίψει pipeline ακόμη και με σωστό κώδικα.

## WGSL — Διαδρομή ουσιαστικής εξάσκησης

### Σκοπός
Η WGSL περιγράφει ρητά τα shader stages μέσω attributes. Φτιάξε WebGPU pipeline με vertex stage που παρέχει clip position και UV, και fragment stage που παράγει gradient με κυκλική μάσκα. Χρειάζεται JavaScript WebGPU host για device, pipeline και render pass· μόνο του το WGSL αρχείο δεν εμφανίζει pixels.

### Ζευγάρι shader stages (gradient.wgsl)
~~~wgsl
struct VertexOut {
    @builtin(position) clip_pos: vec4f,
    @location(0) uv: vec2f,
};

@vertex
fn vs_main(@builtin(vertex_index) index: u32) -> VertexOut {
    var positions = array<vec2f, 3>(
        vec2f(-1.0, -1.0), vec2f(3.0, -1.0), vec2f(-1.0, 3.0)
    );
    var result: VertexOut;
    let p = positions[index];
    result.clip_pos = vec4f(p, 0.0, 1.0);
    result.uv = (p + vec2f(1.0, 1.0)) * 0.5;
    return result;
}

@fragment
fn fs_main(input: VertexOut) -> @location(0) vec4f {
    let uv = clamp(input.uv, vec2f(0.0), vec2f(1.0));
    let d = distance(uv, vec2f(0.5, 0.5));
    let inside = 1.0 - smoothstep(0.23, 0.27, d);
    return vec4f(mix(vec3f(uv, 0.2), vec3f(1.0, 0.8, 0.1), inside), 1.0);
}
~~~

Το μεγάλο τρίγωνο καλύπτει το clip region όταν ο host καλεί draw(3). Το vertex_index πρέπει να μένει στο [0,2], αλλιώς γίνεται προσπέλαση εκτός array. Το format της εξόδου πρέπει να ταιριάζει με το render target του pipeline.

### Συστηματικοί έλεγχοι
1. Δημιούργησε pipeline με vs_main και fs_main, κατάλληλο canvas format και draw(3). Έλεγξε πρώτα τα validation errors.
2. Άλλαξε το fragment input @location(0) σε @location(1), αφήνοντας την έξοδο vertex αμετάβλητη. Κατάγραψε το πρόβλημα διεπαφής.
3. Στο UV (0.5,0.5) το inside είναι 1, ενώ στο (0,0) είναι 0· η μετάβαση είναι μεταξύ αποστάσεων 0.23 και 0.27.
4. Αν δεν υπάρχει WebGPU device, ξεχώρισε αυτή την αποτυχία από σφάλμα shader code.
5. Ως επέκταση πρόσθεσε uniform με @group(0) @binding(0) και ταύτισε bind-group layout και πραγματικά resources.

### Τεκμήρια
Αποθήκευσε shader και host, έκδοση browser, στοιχεία adapter/device, πλήρη diagnostics και screenshot. Η στατική ανάγνωση ή επιτυχής δημιουργία pipeline χωρίς draw pass δεν αποδεικνύει οπτικό αποτέλεσμα.
