#include <iostream>
#include <numeric>
#include <vector>
int main() {
    std::vector<int> numbers{2, 4, 6};
    std::cout << std::accumulate(numbers.begin(), numbers.end(), 0) << '\n';
}
