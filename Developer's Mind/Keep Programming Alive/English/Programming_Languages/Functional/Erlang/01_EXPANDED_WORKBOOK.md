# Erlang — pattern matching and guarded recursion

## Save an actual Erlang module

~~~erlang
-module(sums).
-export([sum/1]).
sum([]) -> 0;
sum([Head | Tail]) when is_integer(Head) ->
    Head + sum(Tail).
~~~

Save as sums.erl and run c(sums). in an Erlang shell, followed by sums:sum([2,3,4]). Predicted return value: 9. Each recursive call removes one list head; the empty list clause supplies the base case. The guard requires integer values instead of silently treating text as numbers.

## Reproduce a meaningful error

Try sums:sum([2,apple]). When recursion reaches the atom, no clause matches. Capture the actual exception. Decide whether this API should reject the input or return a tagged error tuple. Avoid skipping invalid elements, which would falsify the total.

## Process isolation lab

Bind Receiver = self() in the shell, then spawn(fun() -> Receiver ! sums:sum([1,2,3]) end). Use a receive expression to get the result. Explain why messages cross process boundaries while variables do not become shared mutable state. Record Erlang/OTP version and observed outcomes; the fixture has not been run here.

## Extend the contract without losing error information
A production API might return {ok, Total} for a valid list and {error, bad_item} when a head fails the guard. Design a wrapper that calls the recursive worker only after validating the entire list, or implement a second clause that reports the first invalid item. Compare these strategies on [1,2], [], [1,apple] and [1,2.5]. Erlang distinguishes floats from integers, so the guard rejects 2.5 despite it being numeric. Explain how the spawned worker could send tagged success or failure to its requester, and how a receive ... after timeout prevents a caller from waiting indefinitely for a crashed worker.

## Erlang

**Typical use:** Functional programming.

**Suggested file extension:** `.erl`.

**How to run / environment:** Compile module with erlc; call hello:greet("Ada"). in erl.

### Starter example

```
-module(hello).
-export([greet/1]).
greet(Name) -> io:format("Hello, ~s!~n", [Name]).
```

### How to read it

The module and file names match; the VM emphasizes processes.

### Common pitfall

The module and file names match; the VM emphasizes processes.

## Erlang — Practical runnable code lab

### How to run the samples

These independent samples use the appropriate language toolchain. Representative command: `escript {file}`. Replace placeholders with the actual filename, keep test data isolated, and do not interpret this as automatic installation.


## Erlang — Technical notes and common pitfalls

### Core knowledge

1. Processes communicate by message passing and do not share mutable heap objects like threads.
2. Pattern matching is used for function clauses and message handling.
3. OTP behavior and supervision patterns support fault-tolerant services.
