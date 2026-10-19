# datalog — consolidated language guide

## Datalog

Datalog derives relationships from facts and rules. The following sample is for the Soufflé engine, not Prolog.

### Reproducible experiment

Save as paths.dl:

~~~datalog
.decl edge(src:symbol, dst:symbol)
.decl reachable(src:symbol, dst:symbol)
.output reachable
edge("a","b").
edge("b","c").
reachable(x,y) :- edge(x,y).
reachable(x,z) :- edge(x,y), reachable(y,z).
~~~

With Soufflé installed, run souffle -D- paths.dl. Expected tuples are (a,b), (b,c), (a,c), without guaranteed order. The first rule finds direct edges; the second extends known paths. Datalog relations are sets, so repeated facts do not produce repeated results.

### Diagnose and extend

Add edge("c","a"). and observe self-reachability in a cycle. Change a symbol field to number to test type checking. Restore the type afterward.

**Exercise:** derive nodes with two different outgoing neighbors and test a node with no edges. Explain why recursive closure differs from a single SQL join.

**Troubleshooting:** an unknown directive suggests a dialect mismatch; missing output can indicate no .output declaration. Check the working directory and Soufflé version.

Reference: https://souffle-lang.org/datalog-language

## Datalog: applied exercises

Start from the existing [Datalog language lesson](Datalog.md). Its working source is `paths.dl`, using `.decl edge`, `.decl reachable` and the `souffle -D- paths.dl` command. This exercise does not refer to `parent("Ada","Grace")`: that fact does not occur in the actual source.

### Graph closure
The starting graph contains a→b and b→c. Derive the complete reachable relation *before* running the engine. It must contain exactly (a,b), (b,c) and (a,c), with order irrelevant. The first reachability rule produces the direct edges; the second rule finds the extra path. Adding `edge("c","a").` creates a directed cycle. All three nodes now reach all three nodes, including themselves: predict and verify nine distinct tuples. A duplicate edge fact must not duplicate result tuples because Datalog relations have set semantics.

### Define a relation for exactly two steps
Keep the original declarations and rules, then append:

~~~datalog
.decl two_hops(src:symbol, dst:symbol)
.output two_hops
two_hops(x,z) :- edge(x,y), edge(y,z).
~~~

In the original acyclic graph, two_hops has only (a,c). Add an edge c→d: (b,d) also qualifies, but (a,d) needs three steps, not two. Distinguish this rule from unrestricted recursive transitive closure. Explain why a cycle can make a same-node pair appear in two_hops.

### Failure investigation
In a *temporary copy*, put a numeric value where an edge argument was declared `symbol`. Record the compiler's actual type diagnostic, not an invented message. Then remove `.output two_hops`; the engine may still derive the relation internally, but it is no longer requested as printed output. Restore each modified file before the next experiment.

**Evidence to submit:** the three-tuple baseline, the nine-tuple cycle, a two-hop result with d, the actual Soufflé version and a captured failure. If the runtime is missing, label your result **static derivation only** rather than stating that the exercise passed.
