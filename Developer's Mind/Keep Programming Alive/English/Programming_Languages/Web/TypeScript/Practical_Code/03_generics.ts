function first<T>(values: T[]): T | undefined {
  return values[0];
}
console.log(first([1, 2, 3]));
console.log(first(['Ada', 'Grace']));
