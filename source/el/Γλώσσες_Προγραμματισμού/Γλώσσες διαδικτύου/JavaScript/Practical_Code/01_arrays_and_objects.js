// Run with Node.js. No downloads or network requests.
const users = [{name: 'Ada', age: 30}, {name: 'Grace', age: 40}];
const names = users.filter(user => user.age >= 35).map(user => user.name);
console.log(names);
