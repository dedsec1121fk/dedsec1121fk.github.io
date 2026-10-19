# APK static inspection does not require installing the package

## Treat the package as untrusted input
An APK is ZIP-compatible for many of its contents, but executable resources and signing blocks require format-aware tools. Start with an app you built yourself or are authorized to examine. Record its SHA-256 and use a listing command to inventory paths before extraction. A manifest visible inside the archive may be binary XML, so a generic text editor cannot reliably decode it.

~~~sh
sha256sum sample.apk
unzip -l sample.apk | head -45
unzip -t sample.apk
# When Android SDK build-tools are installed:
apksigner verify --verbose sample.apk
~~~

## Distinguish what each result demonstrates
The archive test checks ZIP member integrity, not Android signing correctness. `apksigner verify` checks applicable APK signature schemes when the SDK tool is available; it does not certify app safety. The AndroidManifest declares requested permissions and components, but declarations alone don't prove those capabilities were exercised. App assets and resources can reveal filenames and UI structure without showing all runtime behavior.

## A bounded lab
Create a trivial “hello” Android application in a disposable development project. Compare the debug and release APK metadata and verification results. Record target SDK, min SDK, package name, signing certificate fingerprint and observed permissions. Never publish the private signing key or claim that a signature match guarantees a publisher is trustworthy.

## Analysis boundary
Do not modify a third-party APK to bypass purchases, authentication or access restrictions. In an authorized audit, report unexpected exported components or sensitive asset disclosures to the owner, with reproduction limited to your own test environment.

Reference: https://source.android.com/docs/security/features/apksigning
