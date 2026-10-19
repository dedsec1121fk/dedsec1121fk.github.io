/* Run with node; fixtures assert observable output and unsafe-input handling. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const context={window:{}};
vm.createContext(context);
vm.runInContext(fs.readFileSync(new URL('../DedSec-Project-Website/assets/knowledge-renderer.js',import.meta.url),'utf8'),context);
const render=context.window.DedSecMarkdown.render;
assert.match(render('~~~python\nprint("<demo>")\n~~~'),/<pre><code>print\(&quot;&lt;demo&gt;&quot;\)<\/code><\/pre>/);
assert.match(render('~~~~text\n~~~\n### inside code\n~~~~'),/<pre><code>~~~\n### inside code<\/code><\/pre>/);
assert.doesNotMatch(render('~~~text\n### not a heading\n~~~'),/<h[1-6]>/);
assert.match(render('```text\n~~~\n```'),/<pre><code>~~~<\/code><\/pre>/);
assert.doesNotMatch(render('<img src=x onerror=alert(1)>'),/<img/);
assert.doesNotMatch(render('[bad](javascript:alert) [bad](data:text/html,x)'),/href=/);
assert.match(render('[safe](#read:en-1)',r=>r),/href="#read:en-1"/);
assert.match(render('| Meaning | Value |\n| --- | --- |\n| offset | 8 |'),/<table><thead>.*<tbody>/);
assert.match(render('## A heading'),/<h3>A heading<\/h3>/);
// Every effective code-fence syntax used by the two main indexes must render
// its source as a code block rather than leaking Markdown tokens into prose.
let checked=0;
for(const name of ['en','el','methods','hacking-guide','hacking-complete-1','hacking-complete-2','termux-troubleshooting','lesson-expansions-termux-curated','deep-dive']) {
  vm.runInContext(fs.readFileSync(new URL('../DedSec-Project-Website/data/'+name+'.js',import.meta.url),'utf8'),context);
}
const keys=['ARCHIVE_EN','ARCHIVE_EL','ARCHIVE_METHODS','ARCHIVE_HACKING','ARCHIVE_HACKING_COMPLETE','ARCHIVE_TERMUX','ARCHIVE_DEEP_DIVE'];
for(const key of keys)for(const row of context.window[key].filter(r=>r.p.endsWith('.md'))) {
  if(/^ {0,3}(?:`{3,}|~{3,})/m.test(row.b)) { assert.match(render(row.b),/<pre><code>/,row.id); checked++; }
}
console.log('KNOWLEDGE_RENDERER_PASS: 10 adverse/format fixtures; '+checked+' effective fenced lessons rendered');

const indented=render('Example:\n\n    git status\n    git diff\n\nDone.');
assert.ok(indented.includes('<pre><code>git status\ngit diff</code></pre>'));
