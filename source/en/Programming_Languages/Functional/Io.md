# io — consolidated language guide

## Io

### Working model
Io is a prototype-based language: objects delegate messages through prototypes rather than instances being built from classes.

### Focused source example
```text
Vehicle := Object clone
Vehicle speed := 0
car := Vehicle clone
car speed = 25
car speed println
```

Change the value on the clone and inspect the prototype value separately. Sketch which object receives a message when a slot is absent locally.

### Evidence to collect
Record the exact Io compiler or runtime version, required dependencies, and output from harmless test data. Predict an observation before checking it, and keep both the initial and revised source to show which change caused the result. Do not claim that a displayed fragment was executed if the platform is unavailable.

### Failure mode worth investigating
Cloning and changing mutable slots are not equivalent to copying an isolated class instance; track delegation and slot ownership.

## Io: applied exercises

### Start with a message chain
Io is prototype-based: objects receive messages rather than invoking free functions through a conventional class system. In a scratch `numbers.io`, investigate this short sequence:

~~~io
numbers := list(1, 2, 3)
squares := numbers map(n, n * n)
squares println
~~~

The expected collection contains 1, 4 and 9. `map` asks each element to participate in evaluating its argument expression; the resulting list is distinct from the original. Check the interpreter's printed representation because `println` is a message sent to the receiver, not a universal language-independent print statement.

### Observe slots and prototypes
Create an object with `Account := Object clone`, then give it a slot using `Account balance := 0`. Compare `Account clone` with the original object and inspect where slot lookup finds `balance`. Do not describe this as automatic deep copying of arbitrary nested state. Write a small message that adds a positive amount, and explain why the method must validate its argument before changing a shared slot.

### Deliberate failure
Send a message that a plain number does not understand, using a separate disposable script. Capture the actual Io diagnostic and describe which receiver and message were involved. This is not a compile-time static type failure: Io message dispatch and slot lookup happen dynamically. Avoid a generic error handler that silently supplies a fake valid result.

### Independent exercise
Build a counter object that supports `increment` and a readable value. Test two clones to determine whether the state is shared or independent, and record results instead of assuming a particular copy policy. Include an empty input collection, zero, negative numbers and repeated calls. Document the Io implementation and version. Background: https://iolanguage.org/
