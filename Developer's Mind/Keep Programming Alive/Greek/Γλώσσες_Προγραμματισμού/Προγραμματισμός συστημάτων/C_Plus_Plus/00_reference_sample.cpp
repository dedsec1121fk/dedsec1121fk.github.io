#include <iostream>
#include <string>
std::string greet(const std::string& n) { return "Hello, " + n + "!"; }
int main() { std::cout << greet("Ada") << '\n'; }
