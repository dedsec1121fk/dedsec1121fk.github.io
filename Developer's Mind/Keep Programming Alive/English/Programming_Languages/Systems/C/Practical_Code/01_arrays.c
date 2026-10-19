#include <stdio.h>
int main(void) {
    int values[] = {4, 2, 9, 7};
    size_t count = sizeof values / sizeof values[0];
    int sum = 0;
    for (size_t i = 0; i < count; ++i) sum += values[i];
    printf("Total: %d\n", sum);
    return 0;
}
