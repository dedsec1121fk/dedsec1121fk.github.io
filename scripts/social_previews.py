#!/usr/bin/env python3
"""Compatibility entry point: build target-specific *static* social metadata.

Do not rewrite source heads with a hard-coded staging domain. Use the universal
builder to create canonical, OG, Twitter, sitemap and AI files in the output.
"""
from build_portable_site import main

if __name__ == '__main__':
    main()
