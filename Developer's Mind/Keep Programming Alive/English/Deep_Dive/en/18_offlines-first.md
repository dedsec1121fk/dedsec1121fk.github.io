# Offline-first browser architecture

## What is happening
Separate a self-contained local reference library from optional external APIs. The core learning pages should render even when a third-party feed fails.

## Practical investigation
Persist only user preferences that are necessary, and clearly label cached remote data with its generation time.

## Common traps
When browser security blocks local file fetches, serve the static project through a local localhost HTTP server instead of disabling security policies.

## Adaptable demonstration
```text
python -m http.server 8765 --bind 127.0.0.1
```

## Test the boundary between bundled content and optional services
Start the local HTTP server while online, load the library and open several lessons. Then block external network requests while keeping localhost available and reload. Core lessons, search and local assets should still work; a remote feed should show its unavailable or dated-cache state. Browser offline emulation that also blocks localhost is a different experiment and cannot alone establish whether the source bundle is self-contained.

A previously loaded page continuing to display is weaker evidence than a fresh navigation with external access blocked. Inspect requests for fonts, images, scripts and dynamic fetches. An external font failure should not hide text, and an optional statistics request must not gate the reader.

If a service worker is introduced, define cache versioning and recovery before enabling it. Serving an old HTML shell with incompatible new data can break navigation even when every file exists. Preference storage should remain separate from content caching; private/incognito restrictions on localStorage must not prevent the basic page from rendering.
