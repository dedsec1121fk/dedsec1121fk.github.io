package main
import "fmt"
func main() {
    results := make(chan int)
    for _, value := range []int{2, 3, 4} {
        go func(n int) { results <- n * n }(value)
    }
    for i := 0; i < 3; i++ { fmt.Println(<-results) }
}
