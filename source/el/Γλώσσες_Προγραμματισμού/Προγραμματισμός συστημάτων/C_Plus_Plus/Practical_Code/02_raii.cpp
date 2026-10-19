#include <iostream>
#include <memory>
struct Player { explicit Player(int n) : score(n) {} int score; };
int main() {
    auto player = std::make_unique<Player>(42);
    std::cout << player->score << '\n';
} // no manual delete required
