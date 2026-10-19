# go — consolidated language guide

## Go

**Typical use:** Systems and low-level programming.

**Suggested file extension:** `.go`.

**How to run / environment:** go run main.go.

### Starter example

```
package main
import "fmt"
func greet(name string) string { return "Hello, " + name + "!" }
func main() { fmt.Println(greet("Ada")) }
```

### How to read it

Explicit error returns are customary in larger Go programs.

### Common pitfall

Explicit error returns are customary in larger Go programs. 

### A Go module with explicit, testable errors

Go commonly represents recoverable failure as an error return value, not an exception. Create a folder with a Go module and this small parsing function:

~~~go
package demo
import (
    "errors"
    "strconv"
)
func ParsePort(text string) (int, error) {
    n, err := strconv.Atoi(text)
    if err != nil { return 0, err }
    if n < 1 || n > 65535 { return 0, errors.New("port out of range") }
    return n, nil
}
~~~

Initialize with go mod init example.com/demo and run go test after adding a file called port_test.go:

~~~go
package demo
import "testing"
func TestParsePort(t *testing.T) {
    for _, tc := range []struct{ raw string; valid bool }{
        {"80", true}, {"0", false}, {"65536", false}, {"abc", false},
    } {
        _, err := ParsePort(tc.raw)
        if (err == nil) != tc.valid { t.Errorf("%s: err=%v", tc.raw, err) }
    }
}
~~~

Understand why strconv.Atoi failure must be checked before range validation. Contrast an error result with panic: malformed user input is expected failure, not a programmer invariant violation. A goroutine does not automatically make CPU-heavy code faster; introduce concurrency only after establishing cancellation and ownership.

**Success:** four tests pass, an invalid port never appears as a valid integer and the caller explicitly handles err. Sources: https://go.dev/doc/tutorial/handle-errors and https://go.dev/doc/tutorial/add-a-test.

## Go — Expanded practice workbook

### Why it matters
A Go struct describes your intended fields, but json.Decoder normally tolerates unknown JSON keys. A typo in a configuration could be silently ignored. Reject unknown fields, enforce semantic bounds and verify no second JSON document follows the first.

### Execute
Save as main.go and run go run main.go. No dependency outside the standard library. Expected output is offline 3. The three bad examples must not reach panic, because each readConfig invocation returns an error.

~~~go
package main
import ("encoding/json"; "errors"; "fmt"; "io"; "strings")
type Config struct { Name string; Limit int }
func readConfig(raw string) (Config, error) {
    var c Config
    decoder := json.NewDecoder(strings.NewReader(raw))
    decoder.DisallowUnknownFields()
    if err := decoder.Decode(&c); err != nil { return c, err }
    if c.Name == "" || c.Limit < 1 || c.Limit > 100 {
        return c, errors.New("bad config values")
    }
    var extra interface{}
    if err := decoder.Decode(&extra); err != io.EOF {
        return c, errors.New("trailing JSON or invalid tail")
    }
    return c, nil
}
func main() {
    good, err := readConfig("{\"Name\":\"offline\",\"Limit\":3}")
    if err != nil { panic(err) }
    fmt.Println(good.Name, good.Limit)
    for _, raw := range []string{
        "{\"Name\":\"x\",\"Limt\":3}",
        "{\"Name\":\"x\",\"Limit\":0}",
        "{\"Name\":\"x\",\"Limit\":2} true",
    } {
        if _, err := readConfig(raw); err == nil { panic("bad data accepted") }
    }
}
~~~

### Explain the decoder
DisallowUnknownFields catches Limt instead of Limit. After the first Decode, the second must return io.EOF. Otherwise there is trailing syntax or an additional value. Empty names and limits outside 1..100 are domain failures; decoding only knows the types.

### Independent exercise
Write table-driven tests using testing.T for null, arrays, fractional numbers, extra JSON, and incorrect field names. Be aware that duplicate object keys can still be accepted by the decoder: detect them separately if your policy forbids duplicates. For network input, cap bytes on the reader before decoding; this string-based demonstration has already loaded its input.

### Troubleshooting
Use go version and, for a proper project, go mod init example/config then go test. Wrap context with fmt.Errorf and %w instead of discarding the original error. Do not log secrets from failing configurations.
Success: output offline 3 and three intentionally rejected inputs. https://pkg.go.dev/encoding/json

## Go — Practical runnable code lab

### How to run the samples

These independent samples use the appropriate language toolchain. Representative command: `go run {file}`. Replace placeholders with the actual filename, keep test data isolated, and do not interpret this as automatic installation.


## Go — Technical notes and common pitfalls

### Core knowledge

1. Goroutines are lightweight concurrent functions but still require cancellation and lifecycle management.
2. Channels coordinate communication; closing a channel is not a general-purpose shared shutdown flag.
3. Errors are usually returned as values and should be inspected explicitly.
