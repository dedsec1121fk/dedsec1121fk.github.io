# Compiler diagnostic reference — C++, Rust and Go

## no matching function for call

### Meaning
Overload resolution cannot find a function accepting the supplied arguments. Read the rejected candidate signatures, including argument count, order, namespace, constness, references and template constraints.

### Reproducible example
~~~cpp
#include <iostream>
#include <string_view>
void repeat(std::string_view text, int count) {
    for (int i=0; i<count; ++i) std::cout << text << '\n';
}
int main() {
    // repeat(2, "hi"); // wrong argument order
    repeat("hi", 2);
}
~~~
Build using `g++ -std=c++17 -Wall -Wextra -pedantic example.cpp -o example && ./example`. The repaired program prints hi twice. Uncomment the invalid call and compile again to inspect the diagnostic.

### Investigate in order
First compare argument number and position against the declaration. Then check whether conversions are allowed. Non-const references cannot bind to arbitrary temporaries, while const references often can. For templates inspect deduction failure and constraints rather than guessing type arguments. If the signature appears correct, confirm the actual included header and namespace.

### Lab
Create an overload accepting only `std::string_view` that delegates to `repeat(text, 1)`. Verify both overloads. Next try `repeat("hi", 2.5)` with `-Wconversion -Werror` and observe the narrowing warning. Keep the original failing call as a compile-fail regression test.

### Evidence
Record compiler version, build flags, expected function signature, actual candidate list, and the smallest change that resolves the mismatch. Avoid casts that merely suppress the type error without proving the API contract.

## use of deleted function

**Language / environment:** C++

### Meaning
An operation requires a method that was deleted or cannot be generated.

### Repair
Review ownership, copying and moving; avoid copying unique_ptr values.

## cargo: failed to select a version

**Language / environment:** Rust

### Meaning
Dependency version constraints cannot be resolved.

### Repair
Inspect Cargo.toml/Cargo.lock and supported versions; avoid blind updates.

## cannot use X as Y in argument

**Language / environment:** Go

### Meaning
A value does not satisfy an expected Go argument type.

### Repair
Read the actual type, interface contract and conversion requirements.

## imported and not used

**Language / environment:** Go

### Meaning
The compiler rejects unused imports.

### Repair
Remove unused imports, or use their declarations deliberately.
