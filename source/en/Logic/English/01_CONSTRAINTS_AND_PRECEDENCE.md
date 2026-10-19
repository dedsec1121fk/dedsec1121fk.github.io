# Logic: preserve the whole problem

Before writing code, separate constraints into:
- **Required behavior:** what must be possible.
- **Forbidden outcome:** breakage, exposure, unauthorized action.
- **Resources:** memory, time, network, build minutes.
- **Evidence:** what must be observed.
- **Unknowns:** what has not been checked.

A later request typically changes only what it explicitly names. “Reduce workflow minutes” does not mean drop Android support. “Make the UI simpler” does not mean remove needed settings.

**Example — offline knowledge archive:** must work on a phone; two languages are equally accessible; search requires no command; index files must match the current lessons; tests must fit the resource budget. A cloud-only search violates the first constraint. An English-only index violates the second. Claiming “search works” without opening it violates the fourth.

**Conflict protocol:** identify the two constraints, estimate options, choose the least destructive feasible compromise, and clearly name the trade-off. Do not silently reinterpret a hard limit.

A requirement is not “remembered” just because it appears in a plan. It is preserved when each change can be traced to an acceptance test.
