const fs = require('node:fs');
const path = require('node:path');
const folder = path.join(__dirname, 'example_output');
fs.mkdirSync(folder, {recursive: true});
const target = path.join(folder, 'notes.txt');
fs.writeFileSync(target, 'Hello / Καλημέρα\n', 'utf8');
console.log(fs.readFileSync(target, 'utf8'));
