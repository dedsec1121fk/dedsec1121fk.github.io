# Pytest discovery, fixture resolution and port conflicts

## pytest collected 0 items

### Meaning and differential diagnosis
Pytest may find no tests because filenames, function names or configured testpaths do not match discovery rules. A collection error is different from an empty test suite, as is running pytest in the wrong directory. Do not make a CI job green by silently accepting zero collected tests.

### Reproduction / nondestructive inspection
~~~python
# Save as test_arithmetic.py; requires pytest.
def add(a, b):
    return a + b

def test_add_integers():
    assert add(2, 3) == 5

def test_add_negative():
    assert add(-2, 2) == 0
~~~

### Interpret evidence and fix the cause
Run python3 -m pytest --collect-only -q from the repository root. Inspect pyproject.toml, pytest.ini or setup.cfg for python_files, python_functions and testpaths. Verify the desired tests appear by node ID. Exit code 5 generally indicates no tests collected; a different nonzero code may mean import/collection errors. Avoid renaming arbitrary production files just to satisfy discovery.

### Practical lab
Rename the file to arithmetic_checks.py and confirm default discovery no longer sees it; run pytest --collect-only -q against its explicit path and explain the difference. Add an assertion in CI that the expected critical test node is present.

## pytest fixture not found

### Meaning and differential diagnosis
Pytest interprets names in a test function's parameters as fixture requests. A typo, a fixture defined in an inaccessible conftest.py, an optional plugin not installed or a mismatched fixture scope may break setup. A regular local variable with the same spelling does not become a pytest fixture automatically.

### Reproduction / nondestructive inspection
~~~python
# Save as test_catalog.py; requires pytest.
import pytest

@pytest.fixture
def catalog():
    return {"books": ["Algorithms", "Networks"]}

def test_catalog_has_books(catalog):
    assert "Algorithms" in catalog["books"]
    assert len(catalog["books"]) == 2
~~~

### Interpret evidence and fix the cause
Read the name of the missing fixture and list available ones using python3 -m pytest --fixtures -q. Trace where conftest.py is located relative to the test module; fixtures in a sibling subtree are not automatically visible. Plugin fixtures depend on the selected interpreter. Prefer narrowly scoped fixtures with explicit setup and teardown over mutable module-global state.

### Practical lab
Rename catalog to catalogue in the decorator function without updating the test parameter; inspect the missing-fixture message. Restore it, then move the fixture into conftest.py and confirm both tests in that directory can reuse it.

## address already in use

### Meaning and differential diagnosis
EADDRINUSE usually means that the requested local address/port combination is already bound. Causes include a second server instance, a listener bound to all interfaces, or address-family differences. Depending on options and OS, recently closed sockets can also affect rebinding. Killing an arbitrary process by port number is unsafe.

### Reproduction / nondestructive inspection
~~~python
import errno
import socket
first = socket.socket()
second = socket.socket()
try:
    first.bind(("127.0.0.1", 0))  # OS chooses a free port.
    port = first.getsockname()[1]
    try:
        second.bind(("127.0.0.1", port))
    except OSError as exc:
        assert exc.errno == errno.EADDRINUSE
    else:
        raise AssertionError("duplicate bind accepted")
finally:
    first.close()
    second.close()
~~~

### Interpret evidence and fix the cause
Inspect listeners with ss -ltnp on Linux/Termux where supported, or lsof -iTCP -sTCP:LISTEN. Confirm process ownership and its working directory before stopping a service. Investigate interface binding (127.0.0.1 versus 0.0.0.0), container port mapping, and IPv6 behavior. SO_REUSEADDR is not a universal fix for two actively listening servers.

### Practical lab
Rerun the fixture on the same host, recording the dynamically chosen port and exception errno. Next run one local test server, try to start a second on that port, then stop only the known first server and verify the second can bind.
