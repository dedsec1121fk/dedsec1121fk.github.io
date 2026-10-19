# objective_c — consolidated language guide

## Objective-C

**Typical use:** General-purpose programming.

**Suggested file extension:** `.m`.

**How to run / environment:** Compile with clang and a compatible Foundation runtime.

### Starter example

```
#import <Foundation/Foundation.h>
int main(void) {
  @autoreleasepool { NSLog(@"Hello, Ada!"); }
  return 0;
}
```

### How to read it

Foundation availability differs by operating system.

### Common pitfall

Foundation availability differs by operating system.

## Objective_C — Focused mastery pathway

### Target environment
Objective-C language support does not imply the Apple Foundation framework is present. Choose either macOS with Foundation and ARC or GNUstep with an explicitly verified build command. The example below targets macOS Foundation and `clang -fobjc-arc -framework Foundation Inventory.m -o inventory`. Do not report it as tested on Linux without GNUstep adaptation.

### Minimal ownership and validation fixture
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

### Model interpretation
Under ARC, `strong` retains the dictionary and `@autoreleasepool` bounds autoreleased objects; avoid manually calling `release` in ARC code. Dictionary subscripting returns nil for absent keys, but nil and the NSNumber value zero are not equivalent. The current API returns NO on bad inputs; a production API might prefer `NSError **` with distinct error codes and user-facing messages.

### Adversarial lab
Try empty SKU, duplicate SKU, sale exceeding stock, zero sale, and missing key. For each, verify that the stored quantity did not change. Add a `dispatch_queue_t` concurrency exercise: demonstrate that unsynchronized mutable dictionaries must not be treated as thread-safe and design serialized writes or a lock. Avoid benchmarking unsynchronized races as reliable output.

### Platform, testing and documentation
On macOS record `clang --version`, target architecture and Foundation SDK version. On GNUstep record exact `gnustep-config` flags and ARC/runtime compatibility; adapt tests to that runtime. Build twice from a clean folder, enable warnings, and preserve compiler output. Document the limits of `NSCAssert` in optimized builds and supplement it with explicit programmatic tests.
