# pip Failed building wheel: read the first compiler failure

## Recognize the actual failure
Some Python packages ship a wheel for a particular CPython version, OS and CPU architecture; others need a compiler and development headers. 'Failed building wheel' is usually a final summary, not the root cause. On Android/Termux many desktop Linux wheels are incompatible.

## Inspect safely before changing anything
~~~sh
python -VV
python -m pip --version
python -m pip install -v PACKAGE
~~~

## Repair the cause rather than suppressing the warning
Inspect the earliest error above the summary: missing header, unsupported Python version, Rust/C compiler requirement or dependency metadata. Confirm a legitimate package release and supported platform before installing toolchains. Prefer a compatible prebuilt wheel or documented distro package. Never paste arbitrary compiler flags from an untrusted forum.

**Reference:** https://pip.pypa.io/en/stable/cli/pip_install/

## Read the first real compiler failure
`Failed building wheel` is often only pip's final summary. Find the first preceding error: `Python.h: No such file`, missing C compiler, `pkg-config` dependency, Rust toolchain, unsupported Python ABI or invalid package source. Inspect the package's `pyproject.toml` build backend and check Python version/architecture. These are different causes and cannot all be fixed by upgrading pip.

## Controlled investigation
In your own source project, run `python -m pip wheel --no-deps . -v` from an activated venv to capture a local build without installing the result system-wide. If that succeeds but dependency installation fails, investigate a dependency rather than this project. Do not install arbitrary build tools as root until the package's documented prerequisites justify them. On Termux wheels published for desktop Linux may not apply to Android; a source build may require supported local libraries or may simply be unsupported.
