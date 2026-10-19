# Go diagnostics: compiler errors, maps and slice panics

## declared and not used

**Language / environment:** Go

### Meaning
The compiler rejects unused local bindings.

### Repair
Use or remove the variable; avoid dummy placeholders in production code.

## fatal error: concurrent map writes

**Language / environment:** Go

### Meaning
A map is being modified unsafely from multiple goroutines.

### Repair
Guard with a mutex, use channels or restructure ownership.

## panic: runtime error: index out of range

**Language / environment:** Go

### Meaning
Slice/array indexing exceeded bounds.

### Repair
Check len and empty cases before indexing.

## Understand what the Go runtime is reporting

A declaration that the compiler considers unused is a build-time error in normal Go source: it stops an executable from being produced. It is not equivalent to a runtime panic. In contrast, concurrent writes to the same ordinary map without synchronization can fail during execution. A slice index outside its bounds also panics while the program runs. Keeping the failure stage separate prevents random package reinstallations from hiding an actual bug.

~~~go
package main
import "fmt"
func main() {
    values := []int{2, 4, 6}
    fmt.Println(values[2])
    // values[3] would panic: valid indices are 0, 1 and 2.
}
~~~

The expected printout is 6. Before uncommenting any out-of-range access, write down that the slice length is three and that index three is invalid. For concurrent map access, redesign ownership so one goroutine handles updates, or guard critical sections with sync.Mutex. Prefer a deliberately small isolated test and execute it with the Go race detector when a supported toolchain is available; a single successful run without a race does not prove the program is race-free.

## Verification checklist

Record the Go compiler version, the exact source file and the phase where the failure arises. Separate compiler diagnostics from runtime panics, include expected output before changing the input, and test at least an empty slice and a length-one slice. If no Go compiler is available, leave observed output unverified instead of inventing a command result.
