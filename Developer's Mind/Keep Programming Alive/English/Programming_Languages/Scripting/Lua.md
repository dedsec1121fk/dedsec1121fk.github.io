# lua — consolidated language guide

## Lua

### Operational idea
Lua is a lightweight embeddable language with tables, first-class functions and a small runtime often used by games.

### Source or deliberately marked concept
```text
local values = {2, 4, 6}
print(#values)
```

### Apply it to one controlled task
Compare table sequence length with a table containing a gap in numeric keys and explain when # has defined behavior.

### Check the important boundary
Lua tables are not inherently dense arrays; operations depending on a sequence boundary need careful key choices.

Work with disposable data in a genuine implementation of Lua where available. Record the actual tool version and compare your prediction with observed output. If a compatible runtime is missing, clearly mark this as static analysis instead of claiming it passed execution. Split the normal case from at least one boundary value, and avoid using sensitive or production datasets merely to follow a tutorial.

## Lua — Expanded practice workbook

### Understand the core abstraction
Lua tables can be arrays, maps, or records, but their iteration rules differ. This exercise accepts an array of records using ipairs and produces a map of totals. It checks the shape of each record before arithmetic and rejects NaN.

### Execute
Save as totals.lua and run lua totals.lua with a compatible Lua interpreter. Expected output: book=7, pen=2. Order of keys in a map is not assumed because the program prints exact known keys.

~~~lua
local function totals(rows)
  local out = {}
  for index, row in ipairs(rows) do
    assert(type(row.name) == "string" and row.name ~= "",
           "row " .. index .. ": invalid name")
    assert(type(row.amount) == "number" and row.amount >= 0 and
           row.amount < math.huge and row.amount == row.amount,
           "row " .. index .. ": invalid amount")
    out[row.name] = (out[row.name] or 0) + row.amount
  end
  return out
end
local data = totals({
  {name = "book", amount = 3},
  {name = "pen", amount = 2},
  {name = "book", amount = 4}
})
assert(data.book == 7 and data.pen == 2)
local ok = pcall(function()
  totals({{name = "book", amount = 0 / 0}})
end)
assert(not ok)
print("book=7, pen=2")
~~~

### The subtle cases
The expression (out[row.name] or 0) is a default for a missing map key. ipairs walks the contiguous sequence of array elements; it is not appropriate for arbitrary sparse tables. The amount check rejects negatives, infinity and NaN: NaN is not equal to itself. pcall turns a thrown assertion error into an inspectable success flag.

### Extension
Write a version returning nil, error_text instead of using assert for untrusted input. Add tests for missing name, string amount, sparse array, decimal amounts and Unicode keys. Decide whether money should use integer smallest units rather than binary floating-point totals.

### Troubleshooting
Use lua -v to see the interpreter version and avoid assuming LuaJIT or Lua 5.1/5.4 share every API. When nil indexing occurs, inspect the record schema, not just the loop. To debug iteration, compare pairs and ipairs on a constructed sparse table.
Success: stable totals and one rejected NaN input. https://www.lua.org/manual/5.4/

## Lua — Practical runnable code lab

### How to run the samples

These independent samples use the appropriate language toolchain. Representative command: `lua {file}`. Replace placeholders with the actual filename, keep test data isolated, and do not interpret this as automatic installation.


## Lua — Focused mastery pathway

### Boundary and acceptance test
Treat a plugin manifest as **data**, never Lua code to execute. Only two read-only operations, scan and inspect, are allowed; each may appear once with an integer limit between 1 and 10. Reject sparse arrays rather than silently ignoring entries. This is a deliberately small validator, not a safe sandbox for unknown Lua modules.

### Runnable Lua 5.4 script
Save as manifest_lab.lua and run lua5.4 manifest_lab.lua (or lua manifest_lab.lua when lua -v confirms 5.4). It uses only the standard library, no file writes and no dynamic load function.

~~~lua
local allowed = {inspect = true, scan = true}
local function check_manifest(items)
  assert(type(items) == "table", "expected an array")
  local count = 0
  for key in pairs(items) do
    assert(type(key) == "number" and math.type(key) == "integer" and key > 0, "invalid index")
    count = count + 1
  end
  local seen = {}
  for i = 1, count do
    local item = items[i]
    assert(type(item) == "table", "hole or invalid entry")
    assert(type(item.command) == "string" and allowed[item.command], "unknown command")
    assert(type(item.limit) == "number" and math.type(item.limit) == "integer"
           and item.limit >= 1 and item.limit <= 10, "limit outside range")
    assert(not seen[item.command], "duplicate command")
    seen[item.command] = true
  end
  return true
end

assert(check_manifest({{command = "scan", limit = 3},
                       {command = "inspect", limit = 10}}))
for _, bad in ipairs({
  {{command = "delete", limit = 1}},
  {{command = "scan", limit = 0}},
  {{command = "scan", limit = 3.5}},
  {{command = "scan", limit = 2}, {command = "scan", limit = 3}},
  {[1] = {command = "scan", limit = 1}, [3] = {command = "inspect", limit = 2}},
}) do
  assert(not pcall(check_manifest, bad), "bad input was accepted")
end
local sparse = {[1] = "first", [3] = "third"}
local visited = {}
for index in ipairs(sparse) do visited[#visited + 1] = index end
assert(#visited == 1 and visited[1] == 1)
print("PASS: bounded manifest, duplicates and sparse-array diagnostics")
~~~

### Explain the language-specific traps
ipairs ends at the first missing numeric index. A careless validator that only calls ipairs can overlook entries after a hole. The initial pairs loop counts numeric keys and the indexed loop rejects gaps; it also rejects string keys and nonpositive indexes. The math.type function separates integers from floats on Lua 5.4. LuaJIT and Lua 5.1 do not offer this same integer subtype, so do not claim portability without adapting that check. Duplicate commands are rejected using a set keyed by their command string.

### Bounded experiments and diagnostics
1. Add a numeric index 0, string key extra, or hole at 2. Predict which precondition rejects each input.
2. Test limit 0, 11, 1.5 and math.huge; explain why the range/type checks reject them. NaN can be created as 0/0 in runtimes that support it; document behavior rather than assuming a portable result.
3. Replace the allowlist with a loose nonempty-string check and demonstrate a rejected operation becoming accepted; then restore the allowlist.
4. Record the exact Lua version. An error calling math.type on an older runtime is a version mismatch, not proof the manifest is valid.

**Evidence:** PASS output, rejection of five malformed manifests and one comparison of pairs versus ipairs on sparse indexes. Keep fixture values synthetic; no host plugin loading or arbitrary execution is part of this lab.

## Lua — Technical notes and common pitfalls

### Core knowledge

1. Tables are the principal built-in collection mechanism and can represent arrays and maps.
2. Lua arrays conventionally start at index 1; check a host engine's extensions.
3. Metatables customize behavior, so plain table operations may have special semantics.
