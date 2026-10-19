# c_plus_plus — consolidated language guide

## C++

**Typical use:** Systems and low-level programming.

**Suggested file extension:** `.cpp`.

**How to run / environment:** c++ -std=c++17 main.cpp -o main && ./main.

### Starter example

```
#include <iostream>
#include <string>
std::string greet(const std::string& n) { return "Hello, " + n + "!"; }
int main() { std::cout << greet("Ada") << '\n'; }
```

### How to read it

Use standard containers and RAII to manage resources.

### Common pitfall

Use standard containers and RAII to manage resources. 

### Ownership before clever abstractions
Modern C++ code should favor values and RAII-managed resources over manual `new`/`delete`. `std::vector` owns its elements, `std::string` owns text storage, and `std::unique_ptr` represents a unique heap owner. A `std::span` is a non-owning view; it does **not** extend the lifetime of its source.
```cpp
#include <vector>
#include <numeric>
#include <stdexcept>
int average_floor(const std::vector<int>& values) {
    if (values.empty()) throw std::invalid_argument("empty");
    long long total = std::accumulate(values.begin(), values.end(), 0LL);
    return static_cast<int>(total / static_cast<long long>(values.size()));
}
```
Use `const&` for large read-only parameters when appropriate, values for small scalars, and move semantics when transferring ownership. Avoid dangling references to temporaries, invalid iterators after vector reallocation, and assuming `std::string` indexing is Unicode character indexing.

**Lab:** test the function with negative/positive values, then replace the vector with a range that outlives its temporary source and explain why that is unsafe. Use sanitizers on your own binaries where available.

## C_Plus_Plus — Expanded practice workbook

### Choosing an interface
A CLI parser can return std::optional<int> instead of inventing a magic failure value such as -1. std::from_chars avoids exceptions and locale-dependent conversion for integers. Unlike many stream extraction operations, it does not silently allow unwanted suffixes when you check the returned pointer.

### Compile
Save as main.cpp and run g++ -std=c++17 -Wall -Wextra main.cpp -o parser && ./parser. Expected C++ parser OK. This uses C++17 optional and charconv, so a compiler that only supports C++11 is insufficient.

~~~cpp
#include <charconv>
#include <iostream>
#include <optional>
#include <string_view>
std::optional<int> parsePort(std::string_view text) {
    if (text.empty()) return std::nullopt;
    int value = 0;
    auto first = text.data();
    auto last = first + text.size();
    auto answer = std::from_chars(first, last, value);
    if (answer.ec != std::errc{} || answer.ptr != last ||
        value < 1 || value > 65535) return std::nullopt;
    return value;
}
int main() {
    if (parsePort("443") != 443 ||
        parsePort("12x").has_value() ||
        parsePort("65536").has_value()) return 1;
    std::cout << "C++ parser OK\n";
}
~~~

### Explain each check
The ec member reports conversion failure, while ptr identifies exactly how many characters were consumed. Rejecting ptr != last makes "12x" invalid. This implementation deliberately rejects leading whitespace instead of trimming it. It also enforces 1..65535 after conversion.

### Practice variations
Test empty text, -1, +42, 0008, trailing spaces, and a huge number. Check from_chars behavior with +, and decide whether to permit signs as part of your input grammar. Implement a trim function returning string_view without allocating, then rerun tests.

### Ownership and errors
string_view does not own memory. Do not store a view into a destroyed temporary string. The optional result owns its int and has no such lifetime issue. When std::from_chars is missing at compile time, inspect language standard and library version rather than adding random headers.
Success: exactly one accepted port and two rejected values. https://en.cppreference.com/w/cpp/utility/from_chars.html

## C_Plus_Plus — Practical runnable code lab

### How to run the samples

These independent samples use the appropriate language toolchain. Representative command: `c++ -std=c++17 -Wall -Wextra {file} -o demo && ./demo`. Replace placeholders with the actual filename, keep test data isolated, and do not interpret this as automatic installation.


## C Plus Plus — Technical notes and common pitfalls

### Core knowledge

1. RAII ties resource cleanup to object lifetime; prefer standard library containers.
2. References, raw pointers and smart pointers express different ownership or access contracts.
3. Undefined behavior is not a recoverable exception and may produce unpredictable results.
## RAII during partial construction and exceptions

Resource Acquisition Is Initialization couples ownership to object lifetime. If a later operation throws, already constructed automatic objects are destroyed during stack unwinding. Raw ownership hidden in an integer descriptor or bare pointer does not acquire this behavior merely because the variable is local.

Prefer a small owning wrapper or a standard smart pointer, and make transfer of ownership explicit. A destructor should normally release resources without throwing. The fixture counts live resources so an exception path produces observable evidence instead of relying on the absence of a crash.

```cpp
#include <cassert>
#include <memory>
#include <stdexcept>
struct Resource {
    static int live;
    Resource() { ++live; }
    ~Resource() { --live; }
    Resource(const Resource&)=delete;
    Resource& operator=(const Resource&)=delete;
};
int Resource::live=0;
int main() {
    try { auto item=std::make_unique<Resource>(); throw std::runtime_error("fixture"); }
    catch (const std::runtime_error&) {}
    assert(Resource::live==0);
}
```

Test a failure while acquiring the second resource and a successful ownership transfer. Borrowed references must not outlive the owning object. RAII handles deterministic in-process cleanup; it does not promise that a destructor runs after abrupt process termination or a power failure.

[Technical reference](https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines#Rr-raii)
