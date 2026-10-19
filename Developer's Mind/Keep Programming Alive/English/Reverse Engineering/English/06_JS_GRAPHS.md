# JavaScript dependency graphs: static imports versus runtime loading

## Model and limits of inference
To understand an unfamiliar JavaScript project you own, start from the application entrypoint and map imports. ESM static import syntax declares dependencies; dynamic import(), require(), workers and script tags add edges at runtime or via another module system. A regular expression can provide a first approximation but cannot accurately parse every JavaScript expression or comment.

## Self-contained authorized fixture
~~~javascript
// Own toy modules; place all three files in one temporary folder.
// api.mjs: export const getValue = () => 7;
// view.mjs: export { getValue } from "./api.mjs";
// main.mjs:
import { getValue } from "./view.mjs";
if (getValue() !== 7) throw Error("unexpected value");
console.log("entry -> view -> api");
~~~

## Investigation and verification
For each module record its path, direct imports, dynamic imports, exports and side effects. Treat npm package imports differently from relative paths, and resolve extensions according to the actual bundler. Use node --input-type=module, a JavaScript parser or a bundler graph output for verification, not an unsafe eval of untrusted dependencies. Cycles matter: an initialized export may be unavailable until execution reaches it.

## Hands-on lab
Create the three toy files and execute node main.mjs. Add an unused module and verify it is not an imported dependency. Then introduce a cycle via a pair of modules and document the difference between graph connectivity and safe initialization.

## Verify an import graph with independent observations
Draw an adjacency list: `main.mjs → parser.mjs`; `parser.mjs → tokens.mjs`. Now add `await import("./optional.mjs")` behind a flag. Static inspection reveals a possible edge, but runtime execution with the flag off will not load that module. Test both states and describe the difference between *reachable*, *loaded*, and *executed* dependencies. In a bundled application, minified chunk names may obscure source structure; use build manifests or source maps only where you have permission. Cyclic dependencies can be valid but importing a binding before initialization can trigger a temporal-dead-zone error.
