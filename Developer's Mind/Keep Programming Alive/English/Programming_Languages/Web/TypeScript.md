# typescript — consolidated language guide

## TypeScript

**Typical use:** Web and typed web languages.

**Suggested file extension:** `.ts`.

**How to run / environment:** Compile with tsc, then run generated JS.

### Starter example

```
function greet(name: string): string {
  return `Hello, ${name}!`;
}
console.log(greet("Ada"));
```

### How to read it

Type annotations are checked before JavaScript output.

### Common pitfall

Type annotations are checked before JavaScript output. 

### Types do not validate remote data
TypeScript checks code at build time. A server response parsed by `JSON.parse` is not magically safe just because it is assigned to an interface. Validate unknown input at the boundary:
```typescript
type Task = { id: number; title: string };
function asTask(value: unknown): Task {
  if (typeof value !== "object" || value === null) throw Error("not object");
  const r = value as Record<string, unknown>;
  if (typeof r.id !== "number" || !Number.isInteger(r.id) ||
      typeof r.title !== "string") throw Error("invalid task");
  return { id: r.id, title: r.title };
}
```
Use discriminated unions (`{kind:"ok", value:T} | {kind:"error", message:string}`) to model successful/failed states rather than optional fields everywhere. Use `strict` mode, narrow `unknown` before use, and avoid `any` in API boundaries. `as` is a type assertion, not proof.

**Exercise:** model loading/success/empty/error states for an offline lesson search and use exhaustive `switch` with `never` to catch new states. Reference: https://www.typescriptlang.org/docs/handbook/intro.html.

## TypeScript — Expanded practice workbook

### Two different guarantees
TypeScript verifies source-level shapes and removes annotations when compiling. It cannot validate JSON arriving from a server. Treat remote values as unknown; only narrow to a trusted type after runtime checks.

### Compile
Save as state.ts and run tsc --strict --target es2020 state.ts && node state.js after installing TypeScript. Expected output is 4.

~~~typescript
type State =
  | { kind: "loading" }
  | { kind: "ready"; count: number }
  | { kind: "error"; reason: string };
function countFromNetwork(raw: unknown): number {
  if (typeof raw !== "number" || !Number.isSafeInteger(raw) || raw < 0)
    throw Error("invalid count");
  return raw;
}
function label(s: State): string {
  switch (s.kind) {
    case "loading": return "Loading";
    case "ready": return String(s.count);
    case "error": return s.reason;
    default: {
      const unreachable: never = s;
      return unreachable;
    }
  }
}
console.log(label({ kind: "ready", count: countFromNetwork(4) }));
~~~

### The deliberate compiler experiment
Extend the State union with {kind:"empty"} but do not add a switch case. Strict compilation fails at the assignment to never, proving that the switch is exhaustive. Restore the case and make the compiler happy. This is a compile-time test, different from tests of input data.

### Runtime contract exercises
Pass NaN, 3.5, -1, null, and "4" to countFromNetwork and check that each throws. Passing JSON.parse(...) through an as assertion does not make the value valid. For UI work, represent error and loading states explicitly, rather than using undefined as an overloaded status.

### Debugging
TS2322 indicates an incompatible type; TS2339 often indicates a property that has not been narrowed. Avoid any around untrusted boundaries. Browsers run the resulting JS rather than TypeScript source with annotations.
Success: compiler catches the missing union branch; runtime rejects all five malformed values. https://www.typescriptlang.org/docs/handbook/2/narrowing.html

## TypeScript — Practical runnable code lab

### How to run the samples

These independent samples use the appropriate language toolchain. Representative command: `npx tsc --strict {file} && node {base}.js`. Replace placeholders with the actual filename, keep test data isolated, and do not interpret this as automatic installation.


## TypeScript — Technical notes and common pitfalls

### Core knowledge

1. Type annotations are checked by the compiler but usually erased from emitted JavaScript.
2. Narrow unknown values before accessing their fields; a type assertion does not validate runtime data.
3. Model distinct states with tagged unions and exhaustive branching.
## Validate unknown JSON before narrowing its type

A TypeScript annotation is erased at runtime. Asserting that parsed JSON is a User does not check that the payload contains the required fields. Receive external data as unknown and narrow it with runtime checks. Decide whether unknown fields are allowed, whether strings may be empty and whether numeric values must be finite integers.

A type guard should express exactly the promise it makes. A guard that checks only the presence of an id cannot safely promise a full profile with nested preferences. Keep the boundary model small and map it into internal objects after validation.

```typescript
type Item = { id: number; name: string };
function isItem(value: unknown): value is Item {
  if (typeof value !== "object" || value === null) return false;
  const row = value as Record<string, unknown>;
  return typeof row.id === "number" && Number.isSafeInteger(row.id) && row.id > 0 &&
         typeof row.name === "string" && row.name.length > 0;
}
if (isItem({id: "7", name: "fixture"})) throw Error("string ID accepted");
if (!isItem({id: 7, name: "fixture"})) throw Error("valid item rejected");
```

Compile the fixture with your TypeScript configuration and execute its emitted JavaScript. Test null, arrays, fractional IDs and nested objects. This guard permits extra properties; change that policy explicitly if an exact schema is required. Avoid copying an untrusted object into privileged configuration with an unrestricted spread.

[Technical reference](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
