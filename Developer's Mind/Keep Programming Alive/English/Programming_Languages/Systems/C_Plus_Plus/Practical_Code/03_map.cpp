#include <iostream>
#include <map>
#include <string>
int main() {
    std::map<std::string, int> counts{{"Ada", 2}, {"Grace", 3}};
    for (const auto& [name, count] : counts)
        std::cout << name << ": " << count << '\n';
}
