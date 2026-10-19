# Browser trust boundaries in static websites

1. A static website still needs careful handling of external URLs, forms and client-side data.

2. Never embed access tokens in HTML or JavaScript; anything sent to the browser can be read.

3. Review external links, third-party scripts, content security policies and stored preferences.

4. Treat URL fragments and imported text as data, not trusted HTML.

5. Exercise: audit a local static page for unnecessary dependencies and unsafe external navigation.

**Scope:** Education and testing on owned or explicitly authorized systems only.
