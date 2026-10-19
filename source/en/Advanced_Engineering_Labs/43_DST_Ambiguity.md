# Daylight-saving ambiguity and scheduling contracts

## Mechanism and contract

A local wall time is not always one instant. During a backward daylight-saving transition, the same displayed time can occur twice; during a forward transition, a range of displayed times does not occur. Storing only a naive datetime loses the zone and ambiguity information required to interpret the appointment.

Separate an instant from a recurring civil-time rule. A log event can be stored as a UTC instant and displayed in a chosen zone. “Run at 09:00 in Athens every day” is a recurrence rule whose UTC offset can change. Record the zone identifier and an explicit policy for missing or repeated times. Zone databases evolve, so retain relevant version information when reproducibility matters.

## Worked local example

```python
from datetime import datetime, timezone
from zoneinfo import ZoneInfo
zone = ZoneInfo("America/Los_Angeles")
a = datetime(2020, 11, 1, 1, 30, tzinfo=zone, fold=0)
b = a.replace(fold=1)
assert a.utcoffset() != b.utcoffset()
assert (b.astimezone(timezone.utc) - a.astimezone(timezone.utc)).total_seconds() == 3600
print(a.isoformat(), b.isoformat())
```

## Failure checks and limits

The historical fixture requires an installed IANA time-zone database or Python's tzdata package. If it is missing, report the dependency rather than substituting the machine's local zone. Test both folds explicitly and compare UTC instants. Attaching a zone with replace does not, by itself, reject a nonexistent local appointment; validate by round-tripping through UTC and applying the scheduling policy.

## Primary reference

[Official documentation](https://docs.python.org/3/library/zoneinfo.html)
