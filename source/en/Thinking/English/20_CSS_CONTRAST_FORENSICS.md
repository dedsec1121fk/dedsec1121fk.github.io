# Investigate CSS contrast with computed styles

A screenshot shows a bright navigation label even after its icon becomes dark. The screenshot is evidence of a mismatch, not evidence of which CSS rule caused it.

## Find the actual winner
1. Select the exact language button in browser DevTools.
2. Check computed `color`, `-webkit-text-fill-color`, `background-color`, `opacity` and the icon pseudo-element's color separately.
3. Inspect the Styles pane for `!important` rules and specificity; a selector containing `:not(#some-id)` still gains an ID's specificity.
4. Compare the same control in dark and light modes, not two screenshots taken with the same stored theme.
5. Change one shared selector, then test every consumer of that shared stylesheet.

## Minimal regression check
```js
const button = document.querySelector('#merged-lang');
const css = getComputedStyle(button);
console.log({ color: css.color, textFill: css.webkitTextFillColor,
              background: css.backgroundColor });
```

If the button is only partly styled, inspect its descendant icon/text nodes. The ancestor's computed color does not prove the child inherited it.

## Completion evidence
Record the element, matched rule, computed values for both themes, and a screenshot. Keep fixed navigation opaque when content scrolls beneath it; make article panels transparent only if legible. Never remove text to hide a contrast problem.
