# proot is a user-space compatibility layer, not a virtual machine

## Set correct expectations
A Linux distribution running through proot inside Termux can offer familiar directories, shells and package commands without Android root. It does not grant privileged kernel features, real container isolation, arbitrary mounts or systemd PID 1 semantics. A command that works on Ubuntu installed natively might fail under proot because access to devices and kernel interfaces remains governed by Android and the host application.

~~~sh
uname -a
id
pwd
cat /proc/1/comm 2>/dev/null || true
command -v systemctl || true
~~~

## Diagnose across both layers
When an executable is missing, check whether you are in native Termux or inside the guest distribution. Compare `command -v python`, `uname -m`, the package manager, and environment variables before installation. Errors opening `/dev` resources may be structural, not a reason to run the guest as root. A command like `systemctl` may exist but fail because a full service manager is not actually running as init.

## Keep work reproducible
Maintain sources in version control and a small file listing guest distribution, architecture and installed dependencies. Keep backups outside ephemeral guest directories. For development tools, prefer running only the build components that need the guest; accessing Android storage directly from the guest may require an explicitly supported bind or path mapping.

## Verification standard
Demonstrate a basic user-space command, a package lookup and a file read in the guest. Record any unsupported service/namespace operation as a platform limitation with the exact error rather than “missing permissions.” Do not suggest bypassing Android sandboxing to emulate unsupported kernel features.

## Three identities to record separately
A guest's displayed UID, the Android application's host UID and the device's kernel privileges are not interchangeable. A guest prompt saying root describes the environment presented to user-space programs; it does not grant Android root. Likewise, a guest package manager installs guest packages, while `pkg` in native Termux targets a different prefix and ABI environment.

## Trace an executable mismatch
Write down `command -v python`, the active shell and `uname -m` in both environments. A missing loader, an architecture mismatch and an absent command are distinct failures. Keep guest-created virtual environments with the guest interpreter that created them. Do not repair missing libraries by copying arbitrary `.so` files from the native Termux prefix into the guest.

## Boundary test for background work
Start a harmless short-lived command, observe its exit code, then compare a longer test when the Android app is backgrounded. The guest cannot guarantee survival against host process termination. Save progress incrementally and make a resumed operation idempotent, so restarting does not duplicate output. A guest service launcher can help a user-space daemon but does not establish a real booted systemd system.
