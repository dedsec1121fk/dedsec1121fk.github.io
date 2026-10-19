# Track behavior through a generated JavaScript bundle

## Begin with a legally inspectable sample
Use a small application you wrote with two ES modules: one exports a pure formatting function and the other adds a DOM event listener. Build it with a documented bundler and preserve the unminified sources, output bundle and optional source map. Minification may rename symbols, merge modules and reorder safe expressions; string-searching a function name is therefore an unreliable proof of whether behavior survived.

**format.mjs**

~~~javascript
export const label = (n) => `count=${Number(n)}`;
~~~

**ui.mjs**

~~~javascript
import {label} from './format.mjs';
document.querySelector('#count')?.addEventListener('click', () => {
  console.log(label(4));
});
~~~

## Map the data flow
Find the click handler registration, the call that transforms input, and the output sink (`console.log` here). Explain which value enters the function and what a visible click should emit. Compare the generated bundle before and after adding a second module. A source map may help correlate positions but is optional and can expose original filenames; inspect it locally before distributing it.

## Four investigation pitfalls
Not seeing a readable import statement after bundling does not mean the import was removed. Dead-code elimination can omit unreferenced branches. A dynamic import may create a separate chunk. A minified symbol with a familiar name does not establish program intent without call-site evidence. Do not inject code into a third-party service or intercept user sessions to confirm a hypothesis.

## Acceptance evidence
Keep a small graph: entry module → handler → transformation → sink, with output-file offsets or line ranges. Test the click inside your own app, verify the expected message, and document whether tree shaking changes the bundle. Never present an inferred dependency graph as observed runtime execution without a run trace.
