# Defensive log analysis with privacy

1. Start with an observed problem and a narrow time range; collect only logs you are allowed to inspect.

2. Mask API keys, session identifiers, phone numbers and addresses before sharing evidence.

3. Separate the first meaningful error from later consequences and retries.

4. Compare a healthy request with the failing request under the same controlled conditions.

5. Exercise: write a timeline and record how you confirmed the fix without excessive logging.

**Scope:** Education and testing on owned or explicitly authorized systems only.
