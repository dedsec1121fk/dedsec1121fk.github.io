# Objective-C — boxed Foundation numbers versus C integers

## Use a typed NSArray and calculate a total

~~~objective-c
#import <Foundation/Foundation.h>
int main(void) {
  @autoreleasepool {
    NSArray<NSNumber *> *values = @[@2, @3, @4];
    NSInteger total = 0;
    for (NSNumber *item in values) {
      total += item.integerValue;
    }
    NSLog(@"%ld", (long)total);
  }
  return 0;
}
~~~

Save as main.m. With an Apple Foundation SDK, the expected numeric part of the log is 9; NSLog can add timestamps and process metadata. Each NSNumber is an object and integerValue obtains a C-compatible integer for addition.

## Understand a type mismatch

Try an NSString in a deliberately untyped test collection, then inspect the difference between static generics diagnostics and runtime message dispatch. Do not assume that every Foundation object responds meaningfully to integerValue. Explain the role of @autoreleasepool and why returning a pointer after its object's lifetime would be dangerous.

## Verify portability

Apple Foundation uses platform-specific compiler and SDK settings; GNUstep uses different flags and runtimes. Termux does not imply Apple Foundation availability. Record actual compiler, SDK, build command and resulting warnings when available. No Objective-C compilation was done in this audit.

## Reason about collection contents
NSArray<NSNumber *> communicates an expectation to the compiler but Objective-C generics do not prove that serialized or dynamically inserted values are safe at runtime. If values originate in JSON, inspect their Foundation class before converting, and document whether booleans should count as numbers. Compare using NSInteger for an architecture-dependent count with an exact-width integer when writing binary file formats. In a separate empty-array test, the sum should remain zero and the loop should execute zero times. Verify that autorelease pools manage autoreleased Objective-C objects; they do not free arbitrary C allocations or validate pointer lifetimes by themselves.
