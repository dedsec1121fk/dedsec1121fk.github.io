# Go: ignored error

## Broken example — DO NOT USE

```text
data, _ := os.ReadFile("notes.txt")
fmt.Println(string(data))
```

## Fixed example

```text
data, err := os.ReadFile("notes.txt")
if err != nil { return err }
fmt.Println(string(data))
```

## Why it fails and the repair works

Never silently discard file I/O failures; this is a fragment within a function returning error.

## Complete Go file-error lab
Ignoring the second return value from `os.ReadFile` converts an I/O failure into an empty byte slice. The caller may then mistake failure for a legitimate empty file. Wrap errors with `%w` to retain the original cause for `errors.Is`.

~~~go
package main
import ("errors"; "fmt"; "os")
func read(path string) ([]byte, error) {
    data, err := os.ReadFile(path)
    if err != nil { return nil, fmt.Errorf("read %q: %w", path, err) }
    return data, nil
}
func main() {
    f, err := os.CreateTemp("", "readlab-*")
    if err != nil { panic(err) }
    name := f.Name()
    defer os.Remove(name)
    if _, err := f.WriteString("hello"); err != nil { panic(err) }
    if err := f.Close(); err != nil { panic(err) }
    data, err := read(name)
    if err != nil || string(data) != "hello" { panic("read failed") }
    _, err = read(name + ".missing")
    if !errors.Is(err, os.ErrNotExist) { panic("missing file not detected") }
    fmt.Println("PASS")
}
~~~

Save as `readlab.go` and run `go run readlab.go`. The program creates a disposable file, verifies its contents, and checks that a missing file remains distinguishable using `errors.Is(err, os.ErrNotExist)`. An empty existing file would return a zero-length slice with a **nil** error, which is different. Avoid swallowing errors or logging them and continuing as if the operation succeeded. For production code, prefer returning errors to the boundary that can decide whether to retry, show a message, or abort.
