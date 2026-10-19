# Failure handling and memory ownership in systems code

## Bash: no failure handling

### Broken example — DO NOT USE

```text
cp "$src" "$dst"
echo "Backup complete"
```

### Fixed example

```text
if cp -- "$src" "$dst"; then
  echo "Backup complete"
else
  echo "Backup failed" >&2
  exit 1
fi
```

### Why it fails and the repair works

Only report success when the operation succeeds.

### Exercise: inject an I/O failure
The last command in a script determines its final exit status unless failures are handled. An unconditional success message can therefore conceal a failed copy. Test the actual operation and return nonzero when it fails.

~~~bash
#!/usr/bin/env bash
set -euo pipefail
tmp=$(mktemp -d)
src="$tmp/source.txt"
dst="$tmp/backup.txt"
trap 'rm -f -- "$src" "$dst"; rmdir -- "$tmp"' EXIT
printf 'verified content\n' > "$src"
backup() {
  if cp -- "$1" "$2"; then
    printf 'Backup complete\n'
  else
    printf 'Backup failed\n' >&2
    return 1
  fi
}
backup "$src" "$dst"
cmp -- "$src" "$dst"
if backup "$tmp/missing.txt" "$dst"; then
  exit 1
fi
cmp -- "$src" "$dst"
printf 'Expected failure detected; valid backup preserved\n'
~~~

Run `bash backup_lab.sh`. The deliberately missing source must fail while the earlier destination remains unchanged. `set -e` has conditional and pipeline exceptions; explicit status checks remain necessary. For pipelines use `pipefail`. For critical backups, write a temporary destination, verify it, and rename it on the same filesystem only after success.

## C: unchecked input buffer

### Broken example — DO NOT USE

```text
char name[16];
scanf("%s", name);
```

### Fixed example

```text
char name[16];
if (fgets(name, sizeof name, stdin) == NULL) return 1;
```

### Why it fails and the repair works

Use bounded reads and check the return value.

### Complete C11 input-boundary lab
An unrestricted `scanf("%s", name)` may write past the array. `fgets` bounds the read and always terminates a successful string, but an overlong line can leave unread input for the next prompt. Reject the oversized case explicitly.

~~~c
#include <stdio.h>
#include <string.h>
int main(void) {
    char name[16];
    if (!fgets(name, sizeof name, stdin)) return 1;
    size_t n = strcspn(name, "\n");
    if (name[n] == '\n') {
        name[n] = '\0';
    } else if (n == sizeof name - 1) {
        fputs("Input too long\n", stderr);
        return 2;
    }
    printf("Hello, %s\n", name);
    return 0;
}
~~~

Compile: `cc -std=c11 -Wall -Wextra -pedantic input.c -o input`. `printf 'Ada\n' | ./input` should succeed; `printf 'abcdefghijklmnop\n' | ./input` must return 2. Empty stdin returns 1. The exact maximum accepted length is 14 characters when newline is present: one byte is reserved for NUL. This deliberately conservative version rejects a 15-character line without newline; adapt EOF policy to your protocol. Use sanitizers to catch other memory defects, not as a substitute for bounds checks.

## C++: ownership of resources

### Broken example — DO NOT USE

```text
int* p = new int(7);
// forgotten delete
```

### Fixed example

```text
auto p = std::make_unique<int>(7);
// include <memory>
```

### Why it fails and the repair works

RAII releases memory when ownership goes out of scope.

### Complete ownership lab (C++17)

The critical question is who releases the resource on every exit path, including exceptions. A unique_ptr expresses exclusive ownership; move transfers that ownership without duplicating it.

~~~cpp
#include <cassert>
#include <memory>
#include <utility>
int main() {
    auto first = std::make_unique<int>(7);
    assert(*first == 7);
    auto second = std::move(first);
    assert(!first);
    assert(second && *second == 7);
    second.reset();
    assert(!second);
}
~~~

Compile: `c++ -std=c++17 -Wall -Wextra -pedantic ownership.cpp -o ownership && ./ownership`. For a negative compile-time test, try copying second into another unique_ptr: the compiler must reject the copy. Prefer stack values or vector when dynamic ownership is unnecessary; shared_ptr is appropriate only when multiple owners truly share lifetime.
