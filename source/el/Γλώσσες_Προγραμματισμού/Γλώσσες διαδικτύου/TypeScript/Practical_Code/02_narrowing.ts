function message(value: string | number): string {
  return typeof value === 'number' ? value.toFixed(2) : value.toUpperCase();
}
console.log(message(2.5));
console.log(message('hello'));
