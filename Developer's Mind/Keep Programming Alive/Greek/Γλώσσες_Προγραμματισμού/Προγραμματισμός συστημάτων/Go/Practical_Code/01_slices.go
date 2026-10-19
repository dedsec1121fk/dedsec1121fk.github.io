package main
import "fmt"
func main() {
    values := []int{2, 4, 6}
    total := 0
    for _, value := range values { total += value }
    fmt.Println("total:", total)
}
