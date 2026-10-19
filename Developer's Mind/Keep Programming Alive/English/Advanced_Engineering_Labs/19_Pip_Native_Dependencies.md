# A failed pip install may be a platform compatibility problem

## Find out which interpreter and architecture are active
On Termux, packages distributed as prebuilt wheels for ordinary Linux desktop systems may not include a binary compatible with Android. The error may occur while selecting wheel tags or compiling a native extension; retrying with sudo is neither useful nor a supported Android recovery strategy. Inspect Python, pip and platform information before installing again.

~~~sh
python -c 'import sys,platform; print(sys.version); print(sys.executable); print(platform.machine())'
python -m pip --version
python -m pip debug --verbose
~~~

## Distinguish three failures
“No matching distribution” can arise from an unsupported Python version, a missing compatible platform wheel, or a package/version constraint. A failure while building a wheel usually includes actual compiler or header diagnostics. An import error after installation can instead mean a missing shared library or that a different interpreter is running. Preserve the first meaningful error lines and the exact requested version; don't silently replace them with random version downgrades.

## Reproduce with a disposable environment
Use a new directory under the private Termux home and check whether `python -m venv` works in that installation. A project-local venv can isolate Python packages, but cannot turn Android into glibc Linux. Inspect whether Termux's package repository already provides the relevant native component, and prefer maintained packages over arbitrary binaries. Verify license and provenance of any third-party build instructions before following them.

## Define success clearly
Installation succeeds only if a minimal `import` works and the desired API can execute with expected results. Record Python release, Android release, architecture, package version and the command that performed the successful check. If no compatible build exists, document that limitation instead of fabricating a successful install.

Official baseline: https://docs.python.org/3/library/venv.html
## Separate interpreter tags from platform compatibility

A wheel name includes interpreter, ABI and platform tags. Matching the CPU architecture alone is not sufficient: Android/Termux uses a different platform environment from ordinary glibc Linux. A Linux ARM wheel is not automatically a compatible Android package. The active Python executable and its build configuration are part of the evidence.

Before attempting a source build, record the interpreter, platform, package version and full compiler error. Distinguish a missing compiler from unavailable system headers and a project that assumes desktop-only APIs. Repeating pip install with administrative privileges does not solve an incompatible binary ABI.

```python
import platform, sys, sysconfig
facts = {"python":sys.version.split()[0], "machine":platform.machine(),
         "platform":sysconfig.get_platform(),
         "extension_suffix":sysconfig.get_config_var("EXT_SUFFIX")}
assert facts["python"] and facts["platform"]
print(facts)
```

The diagnostic runs on the current machine and does not claim that this machine is Android. Compare its output with the target phone before selecting packages. Preserve the first meaningful compiler error; the final “failed building wheel” line usually describes the outcome rather than the cause.

[Technical reference](https://packaging.python.org/en/latest/specifications/platform-compatibility-tags/)
