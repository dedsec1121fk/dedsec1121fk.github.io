# Browser application tracing: map a request to the rendered screen

## Model and limits of inference
The visible page is the outcome of HTML parsing, CSS layout, JavaScript execution and network responses. Begin from a reproducible action: open the page, click a control, or scroll once. In DevTools, separate a missing resource (Network), a script exception (Console) and a layout or stacking issue (Elements/Computed). They can produce similar symptoms with different fixes.

## Self-contained authorized fixture
~~~html
<!doctype html>
<html lang="en">
<meta charset="utf-8">
<button id="counter">Count: 0</button>
<script>
const button = document.querySelector("#counter");
let count = 0;
button.addEventListener("click", () => {
  button.textContent = "Count: " + (++count);
});
</script>
</html>
~~~

## Investigation and verification
Serve the local HTML over localhost rather than relying on file:// behavior. In Network, enable Preserve log and inspect status, initiator, Content-Type and timing. In Elements inspect the actual DOM node, event targets, computed overflow and pointer-events. Do not assume all errors in Console come from your app; distinguish extension errors and blocked third-party requests. Validate desktop and mobile viewport interactions.

## Hands-on lab
Add a nonexistent script URL and observe the 404 in Network. Next break the click handler with an undefined variable and observe Console while the HTML still loads. Finally set a scrollable container and verify pointer events do not steal gestures outside an intentional interaction area.

## Event ownership and a scroll regression
Create a page with a 3D viewer inside a bounded container and normal text below it. Attach pointer handlers *only to the viewer*, not to `document`. With DevTools' Event Listeners pane, inspect the target and listener type. Scroll while touching outside the viewer; document scrolling must work. Drag inside the viewer; orbit rotation should work without unintentionally scrolling the page. A failed fetch appears under Network, while an exception in the event handler appears in Console; record both if present rather than treating them as the same cause. Check keyboard navigation so dragging is not the only available interaction.
