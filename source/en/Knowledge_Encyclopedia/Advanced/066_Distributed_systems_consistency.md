# Distributed consistency — duplicate events and stale replicas

## Problem and terminology
Suppose two replicas display a counter derived from delivered order events. Replica A receives order-7, but replica B has not received it yet. A read of B returns an older value even though A already processed the event. Eventual consistency permits this transient gap, assuming delivery eventually succeeds. Read-your-writes consistency would require routing or tracking a version so the original writer does not observe an older state. Linearizability is stronger: all operations must appear at one instant between their invocation and completion.

## Executable deterministic model
Save as replica_lab.py and run python3 replica_lab.py. There is no network, consensus engine or actual database: this is a bounded delivery model that demonstrates idempotent handling and temporary disagreement.

~~~python
class Replica:
    def __init__(self):
        self.total = 0
        self.events = set()
        self.version = 0

    def apply(self, event):
        if event["id"] in self.events:
            return False
        self.events.add(event["id"])
        self.total += event["delta"]
        self.version += 1
        return True

a, b = Replica(), Replica()
event = {"id": "order-7", "delta": 2}
assert a.apply(event)
assert not a.apply(event)
assert a.total == 2 and b.total == 0
assert b.apply(event) and b.total == 2
assert not b.apply(event)
assert a.events == b.events
print("PASS: stale read, duplicate delivery, convergence")
~~~

## What this proves and what it cannot prove
An event ID prevents duplicate application *within one replica* as long as the seen set survives. It does not grant exactly-once delivery; messages may be delivered at least once. The example eventually converges after B receives the same event. It does not solve conflicting concurrent writes, lost durable storage, Byzantine faults or leader election. A counter that combines independent updates across replicas needs a formal merge rule or ordered event log, not the simplistic latest-version overwrite.

## Bounded lab tasks
1. Deliver the event to A only, show B's stale read, then deliver it twice to B. Log versions and counters after every step.
2. Introduce a second event with a distinct ID. Try both delivery orders at A and B and check whether the final counter agrees.
3. Simulate a restart that discards the seen IDs and replay order-7. Observe the duplicate count; specify where deduplication state must be made durable.
4. Draw a timeline of a client writing at A and reading from B. State which consistency guarantee the observed stale read violates, and which weaker guarantee still allows it.

**Evidence:** PASS, step-by-step event timeline, explicit assumptions of reliable eventual delivery and one limitation of this model. Do not claim a simulated dictionary implements distributed consensus.
