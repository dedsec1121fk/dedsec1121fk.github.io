# Accessible navigation needs semantic behavior, not decorative icons

## Validate keyboard and touch separately
A clickable graphic must expose a suitable link or button, meaningful accessible name and visible focus state. Hover-only menus fail for keyboard users and many touch devices. If navigation changes a panel rather than opening a page, keep the correct focus order and announce the selected state to assistive technology. Test at 200% zoom and narrow mobile viewport without hiding essential controls.

~~~html
<nav aria-label="Knowledge sections">
  <a href="#programming">Programming</a>
  <a href="#troubleshooting">Troubleshooting</a>
</nav>
<button type="button" aria-expanded="false" aria-controls="details">More details</button>
<section id="details" hidden>Additional guide sections</section>
~~~

## Offline behavior is a separate acceptance criterion
For a site intended for file:// or local HTTP use, relative asset paths matter. Dynamic API calls, external fonts and CDN dependencies may silently fail offline. Verify CSS, images, scripts and search indexes with networking unavailable. A local `file://` browser may apply stricter fetch/CORS behavior than a local HTTP server, so document the supported launch methods precisely.

## Search usability
Search should use real lesson titles and keywords with an explicit no-results state. Keyboard users must be able to submit, clear and revisit search results without losing focus. If the content changes language, update the document's `lang` and visible labels; do not mix English and Greek results unpredictably.

## Evidence checklist
Capture keyboard-only tab sequence, mobile touch screenshots, zoomed layout, offline search and one screen-reader-oriented label inspection. An automated DOM test can catch missing attributes but cannot certify the full usability experience. Do not call a visually attractive page accessible without checking real interactions.
