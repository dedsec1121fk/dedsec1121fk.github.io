#include <stdio.h>
#include <stdlib.h>
int main(void) {
    const size_t count = 4;
    int *values = calloc(count, sizeof *values);
    if (!values) { perror("calloc"); return 1; }
    for (size_t i = 0; i < count; ++i) values[i] = (int)i * 2;
    for (size_t i = 0; i < count; ++i) printf("%d ", values[i]);
    putchar('\n');
    free(values);
    return 0;
}
