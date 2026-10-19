# Cannot read properties of null — distinguish an explicit state from omitted data

## Meaning and root cause
JSON has a null literal, while an object key omitted from a parsed JSON object evaluates to undefined in JavaScript. Both values reject property access but they often mean different things: null can intentionally represent a guest account, while an absent required `user` field may indicate a broken response schema. Treating both as a blank profile silently hides data errors.

## Corrective approach
The profileName boundary explicitly permits JSON user:null as the guest state and accepts a user object only when it has a nonblank string name. It rejects a missing property, a present property with undefined, a null top-level payload and a malformed user object. The tests demonstrate why the policy belongs at the input boundary.

## Executable example
Save as null_lab.cjs.

~~~javascript
function profileName(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload))
    throw new TypeError('profile payload must be an object');
  if (!Object.hasOwn(payload, 'user')) throw new TypeError('user field missing');
  if (payload.user === null) return 'Guest'; // explicitly allowed state
  if (!payload.user || typeof payload.user.name !== 'string' || !payload.user.name.trim())
    throw new TypeError('user object is invalid');
  return payload.user.name;
}
if (profileName(JSON.parse('{"user":null}')) !== 'Guest') throw Error('null state wrong');
if (profileName({user: {name: 'Ada'}}) !== 'Ada') throw Error('profile wrong');
for (const invalid of [{}, {user: undefined}, {user: {}}, null]) {
  try { profileName(invalid); throw Error('invalid profile accepted'); }
  catch (error) { if (!(error instanceof TypeError)) throw error; }
}
console.log('PASS: explicit null state, absent key, malformed object');
~~~

## Why this is different
`Object.hasOwn` distinguishes an omitted key from an inherited property. Optional chaining is appropriate if the UI specification truly allows a null state, but `payload.user?.name || 'Guest'` would also conceal a missing or invalid profile. `typeof null` is 'object' in JavaScript for historical reasons, so checking only typeof without an explicit null test is insufficient.

## Exact validation
Save as null_lab.cjs and run node null_lab.cjs. Expected output PASS. The fixture uses JSON.parse and plain in-memory objects; no browser is required. The helper uses Object.hasOwn available in current Node versions.

## Guided experiments
Compare the values of `JSON.parse('{}').user` and `JSON.parse('{"user":null}').user`. Then write tests for an empty name, a zero-valued user, and an inherited user property. Decide which states are legal in your app instead of adding a default everywhere.

**Reference:** https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining
