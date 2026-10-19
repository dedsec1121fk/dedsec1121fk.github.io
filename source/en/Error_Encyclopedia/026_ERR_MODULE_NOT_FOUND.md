# Node ERR_MODULE_NOT_FOUND: module resolution and paths

## Recognize the actual failure
An ECMAScript import resolves a package, a relative path or an absolute file URL according to Node's module resolution rules. Common causes are a missing package, a relative specifier without a required extension in ESM, a wrong filename case on Linux and imports from an unexpected working directory.

## Inspect safely before changing anything
~~~sh
node --version
node -p "process.cwd()"
node -p "require.resolve('fs')"
~~~

## Repair the cause rather than suppressing the warning
Inspect the exact specifier printed in the error, check package.json type/module mode, and test import('./lib/task.js') using the real case-sensitive path. npm install is appropriate only after confirming the dependency actually belongs in package.json; installing random packages by error-string search can introduce unnecessary risk.

**Reference:** https://nodejs.org/api/esm.html

## Reproducible ESM fixture
Create a temporary folder containing the two files below. Run `node app.mjs` from that folder; no npm installation is needed.
~~~js
// lib/math.mjs
export const double = n => n * 2;
~~~
~~~js
// app.mjs
import { double } from './lib/math.mjs';
console.log(double(21));
~~~
The expected output is `42`. Rename `math.mjs` to `Math.mjs` without updating the import: a case-sensitive filesystem will reject the reference. Restore the filename and change the import to `./lib/math`: native ESM does not generally guess the missing extension for relative imports. The test distinguishes package resolution from a missing local file.

## Decide which resolver is involved
An `ERR_MODULE_NOT_FOUND` stack originating from an `import` in `.mjs` or an ESM package is not automatically fixed by `require.resolve()`; CommonJS and ESM resolution differ. Print the exact attempted specifier, inspect `package.json` exports/type fields, and resolve relative paths against the *importing module*, not the shell's current directory. On Windows test case differences on a Linux CI worker too. Do not install an unknown similarly named package merely because the error contains its name.
