function counter(start = 0) {
  let value = start;
  return () => ++value;
}
const next = counter(5);
console.assert(next() === 6);
console.assert(next() === 7);
console.log('Closure checks passed');
