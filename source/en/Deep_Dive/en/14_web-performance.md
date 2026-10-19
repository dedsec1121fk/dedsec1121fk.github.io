# Browser performance and image budgets

## What is happening
On mobile, large SVG backgrounds and many continuous filters can increase paint and composite costs even if the HTML is static.

## Practical investigation
Prefer one slow transform-only animation over many independently animated nodes. Respect reduced-motion preferences and test on a real mid-range device.

## Common traps
Measure before optimizing: inspect performance flame chart, page weight, long tasks and layout shifts. Avoid speculative minification that harms maintenance.

## Adaptable demonstration
```text
performance.getEntriesByType('resource').length
```

## Compare measurements with the same workload
Measure a first load and a warm-cache load separately at the same viewport. Record transferred bytes, image decoding, long tasks and scrolling responsiveness. Counting resources alone does not estimate their cost: one multi-megabyte image can dominate a page containing many tiny requests. A performance.now timestamp pair measures elapsed time, not a complete breakdown of rendering work.

For a galaxy background, compare a still image with the animation enabled while keeping the artwork and viewport constant. Large blurred/filter surfaces may create expensive intermediate layers. A transform can still be costly when its layer is huge, so “transform-only” is not a universal free-performance guarantee.

Test prefers-reduced-motion by disabling decorative motion while retaining text and controls. Reserve image dimensions to reduce layout shifts, and verify that delaying optional imagery does not delay navigation. A desktop trace is useful for locating work; validate the resulting change on the target mid-range phone before calling it a mobile performance improvement.
