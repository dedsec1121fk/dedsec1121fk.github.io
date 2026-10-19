# Termux:API unavailable: app, plugin and runtime distinction

## Recognize the actual failure
Termux:API commands require support from the companion Android Termux:API application and matching termux-api CLI package. Installing a Python library with a similar name is not equivalent. A missing command, permission denial and unavailable Android feature are different failure categories.

## Inspect safely before changing anything
~~~sh
command -v termux-battery-status
pkg show termux-api
termux-info
~~~

## Repair the cause rather than suppressing the warning
Verify installation source compatibility, Android app permissions and battery/background restrictions. Test a read-only API such as battery status before enabling location, contacts, SMS or other sensitive capabilities. A disabled permission is not a request to work around OS safeguards; offer a clear optional feature path.

**Reference:** https://github.com/termux/termux-api

## Separate Android integration from shell installation
The `termux-api` package inside Termux exposes command wrappers, while the separately installed Termux:API Android application supplies the Android-side services. A missing wrapper is different from an installed wrapper unable to contact the add-on. Run:
~~~sh
command -v termux-battery-status
termux-battery-status
~~~
If the command is missing, verify the Termux package. If it starts but cannot contact the app, inspect the Android add-on, compatibility/signing source and permissions. Android battery information and other API features can be restricted or unavailable depending on OS version; grant only permissions required by the tested command.

## Privacy-safe fixture
Use battery status as a low-risk initial probe. Do not test contact, SMS, microphone or location APIs simply to verify installation, and do not recommend sideloading random APKs. Record whether failure occurs before launching the command, at Android app handoff, or at runtime permission checking. Termux's package name and signing source matter, so mixing incompatible distribution sources can break the integration.
