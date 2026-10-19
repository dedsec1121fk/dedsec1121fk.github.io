package main
import (
    "fmt"
    "strconv"
)
func parsePositive(raw string) (int, error) {
    n, err := strconv.Atoi(raw)
    if err != nil { return 0, fmt.Errorf("not a number: %w", err) }
    if n <= 0 { return 0, fmt.Errorf("must be positive") }
    return n, nil
}
func main() {
    for _, raw := range []string{"9", "x", "-3"} {
        n, err := parsePositive(raw)
        fmt.Println(raw, n, err)
    }
}
