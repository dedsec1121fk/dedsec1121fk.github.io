# require is not defined in ES module scope

## Identify the module system
Node supports CommonJS and ECMAScript modules (ESM). A .mjs file, or a .js file under a package with "type": "module", uses ESM. The CommonJS require function is not available there by default.

~~~javascript
// config.mjs
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const path = fileURLToPath(new URL("./settings.json", import.meta.url));
const text = readFileSync(path, "utf8");
const settings = JSON.parse(text);
console.log(settings.name);
~~~

## Reproduce with a safe fixture
Create settings.json beside config.mjs with {"name":"offline"} and run node config.mjs. The expected output is offline. Resolving relative to import.meta.url avoids depending on the current working directory.

## When CommonJS is appropriate
If the project intentionally uses CommonJS, use a .cjs file and its require syntax consistently rather than randomly renaming package.json. A dependency may offer only one module flavor; inspect its documented exports field before choosing import syntax.

## Follow-up tests
Run the script from a different directory and verify that it still finds its sibling file. Delete settings.json in a scratch copy and make the CLI catch ENOENT distinctly from malformed JSON. Mixing file-relative and working-directory-relative paths is a frequent cause of confusion.

Reference: https://nodejs.org/api/esm.html

## Keep module systems separate
When `package.json` declares `"type": "module"`, a `.js` file uses ESM syntax. Replace CommonJS `const fs = require("node:fs")` with `import * as fs from "node:fs"` if the whole file is ESM. Alternatively a dedicated `.cjs` file remains CommonJS. Test both modes in a disposable project, including JSON imports that may have version-dependent ESM syntax. Do not mechanically replace require calls in third-party files or assume importing ESM with require is equivalent across Node versions.
