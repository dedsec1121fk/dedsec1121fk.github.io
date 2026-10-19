# objective_c — συγκεντρωτικός οδηγός

## Objective-C

**Συνήθης χρήση:** Γλώσσες γενικής χρήσης.

**Προτεινόμενη επέκταση αρχείου:** `.m`.

**Εκτέλεση / περιβάλλον:** Μεταγλώττιση clang με συμβατό Foundation runtime.

### Αρχικό παράδειγμα

```
#import <Foundation/Foundation.h>
int main(void) {
  @autoreleasepool { NSLog(@"Hello, Ada!"); }
  return 0;
}
```

### Πώς διαβάζεται

Η διαθεσιμότητα Foundation διαφέρει ανά λειτουργικό.

### Συνηθισμένο λάθος

Η διαθεσιμότητα Foundation διαφέρει ανά λειτουργικό. Έλεγξε την έκδοση διερμηνευτή/μεταγλωττιστή και μην εκλαμβάνεις το δείγμα ως έτοιμη εφαρμογή παραγωγής.

## Objective_C — Διαδρομή ουσιαστικής εξάσκησης

### Περιβάλλον εκτέλεσης
Η υποστήριξη Objective-C δεν σημαίνει ότι υπάρχει Apple Foundation. Επίλεξε macOS με Foundation/ARC ή GNUstep με επιβεβαιωμένες εντολές build. Το δείγμα στοχεύει macOS: `clang -fobjc-arc -framework Foundation Inventory.m -o inventory`. Μην το χαρακτηρίζεις δοκιμασμένο σε Linux χωρίς προσαρμογή GNUstep.

### Παράδειγμα με έλεγχο κατάστασης
~~~objectivec
#import <Foundation/Foundation.h>

@interface Inventory : NSObject
@property (nonatomic, strong) NSMutableDictionary<NSString *, NSNumber *> *stock;
- (BOOL)addSKU:(NSString *)sku quantity:(NSInteger)quantity;
- (BOOL)sellSKU:(NSString *)sku quantity:(NSInteger)quantity;
@end

@implementation Inventory
- (instancetype)init {
    if ((self = [super init])) _stock = [NSMutableDictionary dictionary];
    return self;
}
- (BOOL)addSKU:(NSString *)sku quantity:(NSInteger)quantity {
    if (!sku || sku.length == 0 || quantity < 0 || self.stock[sku]) return NO;
    self.stock[sku] = @(quantity);
    return YES;
}
- (BOOL)sellSKU:(NSString *)sku quantity:(NSInteger)quantity {
    NSNumber *old = self.stock[sku];
    if (!old || quantity <= 0 || quantity > old.integerValue) return NO;
    self.stock[sku] = @(old.integerValue - quantity);
    return YES;
}
@end

int main(void) {
    @autoreleasepool {
        Inventory *items = [Inventory new];
        NSCAssert([items addSKU:@"A-1" quantity:5], @"first insert");
        NSCAssert(![items addSKU:@"A-1" quantity:7], @"duplicate rejected");
        NSCAssert([items sellSKU:@"A-1" quantity:2], @"sale");
        NSCAssert([items.stock[@"A-1"] integerValue] == 3, @"remaining");
        NSLog(@"PASS");
    }
    return 0;
}
~~~

### Ερμηνεία μνήμης και τιμών
Στο ARC, η ιδιότητα `strong` διατηρεί το dictionary και το `@autoreleasepool` ορίζει όριο autoreleased αντικειμένων· μην καλείς χειροκίνητα `release`. Το subscript επιστρέφει nil για απόν κλειδί, όμως το nil διαφέρει από το NSNumber μηδέν. Το δείγμα επιστρέφει NO σε άκυρη πράξη· πιο πλούσιο API θα μπορούσε να χρησιμοποιεί `NSError **` με σαφείς κωδικούς.

### Εργαστήριο ορίων και ταυτόχρονης πρόσβασης
Δοκίμασε κενό SKU, διπλό SKU, πώληση μεγαλύτερη του αποθέματος, μηδενική πώληση και απόν κλειδί. Επιβεβαίωσε ότι η κατάσταση μένει ίδια στην αποτυχία. Πρόσθεσε δοκιμή με `dispatch_queue_t`: εξήγησε γιατί το NSMutableDictionary δεν είναι αυτόματα ασφαλές για ταυτόχρονες εγγραφές και σχεδίασε σειριοποίηση ή lock.

### Επαλήθευση
Σε macOS κατέγραψε `clang --version`, αρχιτεκτονική και Foundation SDK. Σε GNUstep κατέγραψε `gnustep-config` flags και συμβατότητα ARC/runtime. Κάνε build δύο φορές σε καθαρό φάκελο με warnings. Το `NSCAssert` μπορεί να απενεργοποιείται σε optimized builds· συμπλήρωσέ το με ρητούς ελέγχους και πραγματικό test transcript.
