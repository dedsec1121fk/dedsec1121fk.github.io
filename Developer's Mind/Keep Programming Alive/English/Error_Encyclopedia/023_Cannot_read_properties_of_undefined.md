# Cannot read properties of undefined — make a missing lookup explicit

## Meaning and root cause
JavaScript returns undefined when a requested object property does not exist, or when Array.find sees no matching item. Calling a method or reading another property through that missing value then throws TypeError. The stack trace points to the property access, but the first bad assumption may be an earlier lookup that was never checked.

## Corrective approach
The readTitle helper accepts only an array and finds a record by ID. A missing record is an expected lookup failure and becomes a RangeError with the requested ID; a record with an empty title is a separate schema failure and becomes TypeError. This makes missing data diagnosable instead of allowing an accidental dereference later.

## Executable example
Save as undefined_lab.cjs.

~~~javascript
function readTitle(records, id) {
  if (!Array.isArray(records)) throw new TypeError('records must be an array');
  const found = records.find(item => item && item.id === id);
  if (found === undefined) throw new RangeError('missing record: ' + id);
  if (typeof found.title !== 'string' || !found.title.trim())
    throw new TypeError('invalid title at ID ' + id);
  return found.title;
}
const records = [{id: 1, title: 'Intro'}, {id: 2, title: ''}];
if (readTitle(records, 1) !== 'Intro') throw Error('bad title');
for (const [input, id, expected] of [
  [records, 3, RangeError],
  [records, 2, TypeError],
  [null, 1, TypeError],
]) {
  try { readTitle(input, id); throw Error('bad input accepted'); }
  catch (error) { if (!(error instanceof expected)) throw error; }
}
console.log('PASS: find absence, invalid payload, missing title');
~~~

## Why this is different
Optional chaining (`found?.title`) prevents a crash but does not ensure that a required title exists. It is appropriate for truly optional UI fields, not for constraints that must hold before rendering or persisting data. `typeof found.title` must be tested after confirming that found is an actual object. Consider whether a successful lookup is allowed to contain null entries.

## Exact validation
Save as undefined_lab.cjs and run node undefined_lab.cjs. Expected output PASS. The test covers successful lookup, absent ID, invalid record title and a nonarray argument. All data are local; no DOM or network access is needed.

## Guided experiments
Replace find with findIndex and compare its -1 absence marker. Create duplicate IDs and decide whether the API permits the first result or must reject nonunique identifiers. Inject null among records and explain why the `item &&` guard prevents callback crashes but does not establish complete dataset validity.

**Reference:** https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find
