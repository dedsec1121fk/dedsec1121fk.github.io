# Social link previews — universal build

Social cards are built for all three sites by `scripts/build_portable_site.py` (also callable with the backwards-compatible `scripts/social_previews.py`). The old hard-coded Test metadata procedure is obsolete. **Never edit the source HTML to point to `ded-sec.space/Test/`.**

Read **[Portable site publication / sitemap / AI guide](17_PORTABLE_SITE.md)** for the full requirements, actual domains, Cloudflare setup, and automated checks. For a standalone verification use:

```sh
python3 scripts/build_portable_site.py --target test --output .site-publish
python3 scripts/test_portable_site.py --output .site-publish
```

A shared 1200×630 JPEG is referenced by absolute Open Graph and Twitter metadata. Titles, descriptions, canonical and preview URLs are page-specific. All existing English and Greek records have human-readable sharing pages with stable URLs, because `#read:...` fragments are not separate URLs to messaging crawlers. External preview platforms have their own caches and cannot be fully tested without live HTTPS hosting.
