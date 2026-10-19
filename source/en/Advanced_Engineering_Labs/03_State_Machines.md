# State machines — consent-first download controller

## Learning contract
Model a downloader with new, ready, active, paused, blocked, done and failed states. A network side effect may occur only after a legal transition from ready to active. New requests cannot start until consent is accepted. A refusal moves the session to blocked, which has no shortcut to active. Events are explicit, and an unsupported combination produces an error rather than silently changing state. The following is a pure logic exercise, not a network downloader.

## Executable Python 3 demonstration
Save as state_lab.py and run python3 state_lab.py. The tests assert allowed transitions, four forbidden events and reachability of all declared states.

~~~python
from collections import deque

NEXT = {
    ('new', 'accept'): 'ready', ('new', 'decline'): 'blocked',
    ('ready', 'start'): 'active', ('active', 'pause'): 'paused',
    ('paused', 'resume'): 'active', ('active', 'finish'): 'done',
    ('active', 'fail'): 'failed', ('failed', 'retry'): 'ready'
}

def step(state, event):
    try: return NEXT[(state, event)]
    except KeyError as exc: raise ValueError(f'forbidden: {state}/{event}') from exc

assert step('new', 'accept') == 'ready'
assert step('ready', 'start') == 'active'
assert step('active', 'pause') == 'paused'
assert step('paused', 'resume') == 'active'
assert step('active', 'finish') == 'done'
for forbidden in [('new', 'start'), ('blocked', 'start'),
                  ('done', 'start'), ('paused', 'finish')]:
    try: step(*forbidden)
    except ValueError: pass
    else: raise AssertionError('invalid transition accepted')
seen, queue = {'new'}, deque(['new'])
while queue:
    state = queue.popleft()
    for (source, event), destination in NEXT.items():
        if state == source and destination not in seen:
            seen.add(destination)
            queue.append(destination)
assert seen == {'new', 'ready', 'active', 'paused', 'blocked', 'done', 'failed'}
print('PASS state: consent boundary, illegal events and reachable states')
~~~

## What a correct state model proves
The NEXT dictionary acts as the explicit transition table. The step function returns the next state and does not mutate shared state, so when it raises ValueError, the caller can retain its previous valid state. The breadth-first traversal demonstrates that all seven defined states can be reached from new by following permitted transitions. It does not prove every property of a real downloader: a separate adapter must ensure network calls start only after a successful ready/start transition. Asynchronous callbacks, cancellation, resource cleanup, retries and repeated button taps require integration tests and idempotency rules. Never infer user consent from the mere existence of a download button.

## Engineering exercises with pass criteria
1. Enumerate every state/event combination, marking allowed versus forbidden. Check that each unspecified pair raises ValueError.
2. Add a cancelled state, then decide which states may cancel and whether a second cancellation is an error or an idempotent no-op.
3. Inject a fake side-effect adapter that logs start requests. Prove there are no logs after a new/start or blocked/start attempt.
4. Simulate active/pause twice, failed/retry and active/finish. Record exactly which transitions are valid, and verify no real network traffic is generated.

**Evidence:** PASS output, complete transition matrix, explicit consent boundary and an integration test plan for actual downloads.
