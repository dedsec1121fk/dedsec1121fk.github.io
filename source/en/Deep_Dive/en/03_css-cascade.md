# Debugging CSS specificity and overlays

## What is happening
When a rule seems ignored, inspect the computed style rather than adding another !important. Check selector specificity, stylesheet order, animation and inherited values.

## Practical investigation
For overlapping navbars, inspect position, z-index, isolation and stacking contexts. A child can override inherited visibility, but not an ancestor with display:none.

## Common traps
Use a small browser regression test to check visibility and contrast at 390px and 1280px widths. Preserve keyboard focus outlines even when removing touch highlights.

## Adaptable demonstration
```text
document.querySelector('.panel') && getComputedStyle(document.querySelector('.panel')).backgroundColor
```

## Distinguish hiding mechanisms and stacking contexts
A descendant may override inherited `visibility:hidden` with `visibility:visible`. It cannot undo an ancestor's `display:none`, and a parent's opacity affects the whole composited subtree. Inspect which mechanism actually hides the control before changing its z-index.
~~~css
.wrapper { position: relative; z-index: 1; }
.dialog { position: fixed; z-index: 9999; }
.peer { position: relative; z-index: 2; }
~~~
If dialog lives inside wrapper's stacking context, its large local z-index does not automatically outrank peer's separate context. Temporarily outline their bounds in developer tools and inspect ancestors with transforms, opacity, isolation or positioning. Remove the diagnostic outline after locating the actual overlap.

For a theme regression, inspect computed foreground and the effective background beneath that text, not only a CSS variable declaration. A more specific legacy selector or important rule can override a token. Check keyboard focus after changing overlay hit-testing; a visible button covered by another element can remain unusable.
