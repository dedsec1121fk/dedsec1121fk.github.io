# Network captures contain evidence and potentially private information

## Prefer a synthetic capture
Build a local client/server exchange or use a published training capture with explicit permission. A packet capture can contain IP addresses, hostnames, tokens, chat text or session identifiers; never send raw enterprise/customer traffic to a public service without approval. Begin by recording capture time zone, interface and whether packets were truncated at collection.

~~~sh
capinfos training.pcapng 2>/dev/null || true
tshark -r training.pcapng -q -z conv,tcp
tshark -r training.pcapng -Y 'dns' -T fields -e frame.time_epoch -e dns.qry.name
~~~

## Follow a flow, not merely a port number
A TCP connection can carry an unexpected application protocol; port 443 suggests TLS/HTTPS but doesn't prove it. Inspect protocol dissection, handshakes, timing and payload visibility. TLS encryption limits what a passive capture reveals about application content. Missing packets or capture filters can create false narratives about retransmission and server failure.

## Example question: was DNS the bottleneck?
Pair the client's DNS query and response where visible, compare the timestamp to the subsequent connection attempt, and identify whether the response was cached or a new lookup occurred. A failed domain resolution may precede no TCP connection at all. By contrast, a completed DNS response followed by SYN retransmissions points elsewhere. Distinguish relative time in the capture from a wall-clock timestamp.

## Audit artifact
Document filters, exact frames supporting the observation, packet loss caveats, and relevant endpoint addresses anonymized for sharing. Treat capture display filters as ways to **inspect** evidence, not proof that filtered-out packets never existed.
## Capture order, protocol sequence and observation gaps

Packet timestamps describe the capture point's observation, not a universal ordering of application events across hosts. Clock skew, buffering, retransmission and missing packets can change the apparent story. Keep original packet indices and capture metadata when sorting a timeline.

An absent response in one capture is evidence of non-observation at that capture point. It does not by itself prove that the remote application never replied. The fixture merges synthetic observations and preserves source identity so equal timestamps remain explainable.

```python
observations=[{"time":10,"source":"left","packet":2},
              {"time":9,"source":"right","packet":1},
              {"time":10,"source":"left","packet":1}]
timeline=sorted(observations,key=lambda r:(r["time"],r["source"],r["packet"]))
assert [(r["source"],r["packet"]) for r in timeline] == [("right",1),("left",1),("left",2)]
assert len(timeline) == len(observations)
print(timeline)
```

The tie-breaker provides deterministic display, not a claim of causal order. In real evidence, record capture interface, time resolution, drop counters and any clock correction. Restrict collection to traffic you are authorized to inspect and remove identifying payloads from teaching examples.

[Technical reference](https://www.wireshark.org/docs/wsug_html_chunked/ChAdvTimestamps.html)
