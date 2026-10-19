# Accessible accordions and navigation

## What is happening
A disclosure can use native details and summary, which already support keyboard input. Custom accordions need a button, aria-expanded and a controlled region.

## Practical investigation
Do not attach competing click listeners to the same disclosure after hydration. Check the expanded state and actual panel height, not only the presence of a CSS class.

## Common traps
Keep headings in logical order h1 to h3 and give icon-only controls descriptive labels. An accessible mobile UI should remain understandable without icons.

## Adaptable demonstration
```text
<details><summary>Show installation steps</summary><p>Validated commands.</p></details>
```

## Exercise the disclosure through its actual control
~~~html
<details>
  <summary>Show prerequisites</summary>
  <p>Use a disposable workspace and an available interpreter.</p>
</details>
~~~
Tab to the summary and use Enter or Space. Observe the open property and whether the paragraph becomes available; do not add a second custom toggle that immediately reverses the browser's default action. If a framework replaces the element, check that focus does not disappear into the document body.

For a custom panel, the button's aria-controls must identify a real region, and aria-expanded must match its actual visible state. ARIA does not implement keyboard handling or visibility for you. A link navigates; a button performs an action. Icon-only controls still need names that explain the action in the selected language. Test at 200% zoom with a long Greek label so the target remains visible rather than being clipped by a fixed-height toolbar.
