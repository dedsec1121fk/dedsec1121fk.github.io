# An APK that builds is not automatically installable on the target phone

## Review installation prerequisites
The minimum SDK, CPU architecture, package identifier, signature relationship to any installed version, and storage availability can all affect installation. A newer app with the same application ID may be rejected if it uses a different signing key or a version code inconsistent with platform upgrade rules. Installing on an emulator does not prove the app handles the physical phone's permissions or performance constraints.

~~~sh
# When Android SDK platform-tools/build-tools are installed:
adb devices
adb shell getprop ro.build.version.sdk
adb shell getprop ro.product.cpu.abi
apksigner verify --verbose app-release.apk
~~~

## Avoid common wrong repairs
Do not change the package name or sign with a random key solely to make an update install; that can break access to existing app data. Before any uninstall, confirm how application data is backed up and whether the user approved losing it. If install fails, preserve the exact install error and match it to signing, compatibility or storage evidence.

## Test the interaction, not just startup
Define a device test matrix for touch controls, pause/resume lifecycle, rotation, offline launch, file permissions and app update. For visually intensive software, measure actual frame pacing and input latency on the device rather than relying on desktop performance. Check accessibility text scale and both portrait/landscape modes if supported.

## Release evidence
Record package ID, min/target SDK, APK SHA-256, signature verification output, test device ABI and Android version. A green build plus successful install is still only two steps: real gameplay or app task execution must be verified separately.
