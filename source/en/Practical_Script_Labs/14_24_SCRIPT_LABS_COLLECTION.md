# Practical script labs: streams, ZIP, APIs, UTF-8 and HTTP

## Process a Stream in Batches

A generator groups input lazily into bounded batches. It improves memory use when you do not need the full dataset at once, but partial final batches still need explicit handling.

Test empty input, fewer items than the batch limit, exactly one full batch and a trailing partial batch. Invalid zero or negative batch sizes should fail promptly.

**Working source:** `14_batched_generator.py` contains the standalone Python implementation and its executable assertions. Read the corresponding code entry to compare the explanation with actual behavior.

## Merge Two Sorted Streams

Merge already ordered sequences by comparing their current items; this produces a sorted result without re-sorting the combined dataset. Assumes both sources obey the same ordering rule.

Test duplicate values, one empty stream and differently sized inputs. If an input is unsorted, validate it or document that the output is undefined.

**Working source:** `15_merge_sorted.py` contains the standalone Python implementation and its executable assertions. Read the corresponding code entry to compare the explanation with actual behavior.

## Create a Reproducible Backup Manifest

A manifest should record normalized relative paths, sizes and hashes; it must never silently follow links outside the backup root. Keep metadata separate from the copied files.

Test two files with the same basename in different folders, a filename containing spaces, unchanged reruns and a file that changes during hashing.

**Working source:** `16_backup_manifest.py` contains the standalone Python implementation and its executable assertions. Read the corresponding code entry to compare the explanation with actual behavior.

## Inspect ZIP Contents Before Extraction

List archive members without extracting untrusted content. Normalize member names and flag absolute paths and parent traversal that could escape a destination during extraction.

Test ../ payloads, Windows-style separators, nested folders and duplicate member names. A safe preview does not by itself guarantee that later extraction is safe.

**Working source:** `17_zip_preview.py` contains the standalone Python implementation and its executable assertions. Read the corresponding code entry to compare the explanation with actual behavior.

## Classify HTTP/API Failures

Differentiate authentication, validation, rate limiting, server failures and network timeouts. Let callers react appropriately instead of treating every non-200 response as retryable.

Test 400 and 401 as non-transient, 429 with a retry hint and 503 as possibly transient. Avoid logging tokens, raw credentials or sensitive response bodies.

**Working source:** `19_api_errors.py` contains the standalone Python implementation and its executable assertions. Read the corresponding code entry to compare the explanation with actual behavior.

## Round-Trip UTF-8 Correctly

Encode Unicode text into bytes and decode it using the same character encoding. UTF-8 preserves text when the byte sequence is valid, but it does not preserve the original Unicode normalization form automatically.

Test Greek accents, emoji, combining marks, invalid byte sequences and newline translations. Specify whether errors are strict, replaced or ignored.

**Working source:** `21_utf8_roundtrip.py` contains the standalone Python implementation and its executable assertions. Read the corresponding code entry to compare the explanation with actual behavior.

## Use a Sliding Window for Sequences

Maintain an invariant while advancing a bounded window over an ordered sequence. Sliding-window methods often reduce repeated work but apply only when the chosen invariant supports incremental updates.

Test empty input, a window larger than the sequence, duplicate elements and boundary lengths. State whether indices are inclusive or exclusive.

**Working source:** `22_sliding_window.py` contains the standalone Python implementation and its executable assertions. Read the corresponding code entry to compare the explanation with actual behavior.

## Parse a Minimal HTTP Request Safely

A teaching parser can split a request line and headers under strict size limits, but real HTTP parsing has many edge cases; do not deploy a toy parser as an Internet-facing security boundary.

Test malformed request lines, duplicate headers, CRLF handling, overly long fields and header/body separator ambiguity. Reject invalid input rather than guessing the sender's intent.

**Working source:** `24_simple_http_parse.py` contains the standalone Python implementation and its executable assertions. Read the corresponding code entry to compare the explanation with actual behavior.
