# A static website still processes untrusted data

## Draw the actual trust boundaries
An offline learning portal reads Markdown text, imported JSON/JavaScript indexes, browser preferences and links. The content repository is trusted only after review; third-party snippets, remote links and localStorage values can be malformed or hostile. Model the flow: source archive → curation → website build → browser rendering → optional external URL. Every boundary must identify who controls the data and what action consumes it.

~~~text
Author files -> indexed JSON -> HTML renderer -> DOM
Browser preferences -> display theme / language
External link -> user leaves trusted origin
Build credentials -> deployment service only
~~~

## Two meaningful attacker stories
If Markdown is rendered as unsanitized HTML, a malicious title or code block may inject executable script. If absolute URLs are hard-coded to production, a Test/backup build can send users to the wrong domain and leak environment context. Test escaping with a harmless marker that contains `<script>` as **text**, and assert it stays visible text rather than running. Verify generated canonical/OG URLs for each deployment separately.

## Reduce blast radius
Keep dangerous HTML escaping inside the renderer, restrict externally loaded scripts, never embed tokens in static assets and require least-privilege CI credentials. Treat package upgrades and documentation imports as supply-chain changes. Store no real personal data in example fixtures; provide synthetic cases that can be shared publicly.

## Acceptance record
For each trust boundary list input, possible failure, observable test, control and residual risk. The site is not “secure” merely because it has no backend; browser XSS, malicious downloads, dependency compromise and misleading links still matter.
