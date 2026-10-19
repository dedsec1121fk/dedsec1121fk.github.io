# swift — consolidated language guide

## Swift

### Mental model
Swift uses optionals, value types and protocol-oriented designs across Apple platforms and other supported targets.

### Minimal source sample
```text
let values = [1, 2, 3]
print(values.reduce(0, +))
```

### Experiment to carry out
Compare reduction with an empty array and practice safely unwrapping an optional instead of forcing it.

### A specific failure to distinguish
Swift language support does not imply that UIKit or SwiftUI are available on a non-Apple target.

To evaluate the exercise, record the initial input, predicted behavior and actual observation in a compatible Swift environment. Add a second run changing only one variable or argument; this makes the comparison attributable to a concrete cause. If the required runtime is not installed, treat the example as unexecuted source analysis and never label an imagined output as a passing test.

## Swift — Expanded practice workbook

### Problem
A text field is not automatically an integer. Swift's Int initializer returns an Optional rather than crashing when conversion fails. guard lets you exit early and use the unwrapped value after the boundary.

### Run the exercise
Save as main.swift. Where the Swift compiler is installed, run swiftc main.swift -o parser && ./parser. Expected output: Swift parser OK. The Foundation import provides trimmingCharacters. Verify toolchain availability; Swift is not installed by default on every target platform.

~~~swift
import Foundation
func parseLimit(_ raw: String) -> Int? {
    guard let value = Int(raw.trimmingCharacters(in: .whitespacesAndNewlines)),
          (1...100).contains(value) else {
        return nil
    }
    return value
}
if parseLimit(" 10 ") != 10 || parseLimit("101") != nil ||
   parseLimit("word") != nil {
    fatalError("validation regression")
}
print("Swift parser OK")
~~~

### Read the guard statement
Int returns nil for a noninteger or out-of-range numeric value. The guard condition also applies 1...100, which is application policy. Returning nil removes the need for force unwrap. On success the value is a nonoptional Int for the remainder of the function.

### Extend thoughtfully
Try empty text, leading +, negative values, Unicode whitespace, 0010, 1.5 and very large integers. Replace nil with a throwing parser that reports Missing, InvalidNumber and OutsideRange separately. Explain when an Optional is enough and when diagnostics justify an Error enum.

### Debugging and platforms
A runtime crash from value! usually indicates force-unwrapping a nil Optional. Use guard/if let rather than bypassing the type system. For Apple apps distinguish Foundation APIs from UI frameworks; this terminal lesson runs independently of SwiftUI.
Success: three cases checked with no forced unwrap. https://docs.swift.org/swift-book/documentation/the-swift-programming-language/thebasics/

## Swift — Practical runnable code lab

### How to run the samples

These independent samples use the appropriate language toolchain. Representative command: `swift {file}`. Replace placeholders with the actual filename, keep test data isolated, and do not interpret this as automatic installation.


## Swift — Focused mastery pathway

### Acceptance contract
Decode a small JSON checklist, reject duplicate identifiers and blank titles, verify struct copies do not share mutable state, and demonstrate an encode/decode round trip. Parsing succeeds only for the declared Codable fields: a missing required key is not a valid empty value. This exercise targets Foundation on a Swift CLI, not SwiftUI, iOS permissions or cloud storage.

### Runnable lab
Save as ChecklistLab.swift and run swift ChecklistLab.swift on a system with Swift and Foundation. The checks do not modify any user files.

~~~swift
import Foundation

struct Task: Codable, Equatable {
    let id: Int
    var title: String
    var done: Bool
}

enum ListError: Error { case duplicateId, emptyTitle }

func validate(_ tasks: [Task]) throws {
    guard Set(tasks.map(\.id)).count == tasks.count else { throw ListError.duplicateId }
    guard tasks.allSatisfy({ !$0.title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty })
        else { throw ListError.emptyTitle }
}

let input = """
[{"id":1,"title":"Inspect logs","done":false}]
""".data(using: .utf8)!
let original = try JSONDecoder().decode([Task].self, from: input)
try validate(original)
var copy = original
copy[0].done = true
precondition(original[0].done == false) // struct value semantics
precondition(copy[0].done == true)
precondition((try? validate(original + original)) == nil)
precondition((try? JSONDecoder().decode([Task].self,
    from: Data("[{\"id\":2}]".utf8))) == nil)
precondition((try? validate([Task(id: 3, title: "   ", done: false)])) == nil)
let roundtrip = try JSONDecoder().decode([Task].self,
    from: JSONEncoder().encode(copy))
precondition(roundtrip == copy)
print("PASS: Codable, copy semantics, duplicate IDs, invalid input")
~~~

### Behavior to explain
Task is a struct, so modifying one element of copy cannot mutate original. JSONDecoder handles types and required keys, but it does not enforce business rules such as unique IDs or nonblank titles: validate deliberately runs after decoding. Equatable proves the round trip preserves the chosen model fields. Using force unwraps for unpredictable user input would turn a recoverable parse error into a crash; the known in-source test fixture is the only forced conversion here.

### Bounded variations and diagnostics
1. Remove done from the input JSON. Capture DecodingError.keyNotFound. Contrast this with an optional property and say whether the domain truly permits missing completion state.
2. Add a second task with ID 1: validation must reject it. Try a title consisting only of tabs and spaces, then a title containing a non-Latin character; only the former should fail.
3. Replace Task with a class as an experiment. Mutate copy[0].done and explain the observed sharing. Restore the struct and prove isolation again.
4. For persistence, test an invalid destination path and propagate the write error. Avoid designing a successful-save message before the write actually completes.

**Evidence:** PASS output, one captured decoding error, duplicate-ID rejection, a copy-vs-reference observation and an explanation of why Codable validation is not enough for a domain model.

## Swift — Technical notes and common pitfalls

### Core knowledge

1. Optionals explicitly represent the absence of a value and require safe unwrapping.
2. Value types such as structs have copy semantics, while classes have reference semantics.
3. Use defer for cleanup that should occur when leaving scope.
