# ruby — consolidated language guide

## Ruby

### How the language behaves
Ruby emphasizes objects, blocks and expressive enumerable transformations; standard library APIs enable useful scripts without external gems.

### Source fragment to analyze
```text
numbers = [1, 2, 3]
puts numbers.select(&:odd?).sum
```

### Deliberate exercise
Predict the sum of selected odd numbers and test what happens when the input array is empty.

### Check a failure condition
Methods ending in ! are a naming convention for potentially more surprising behavior, not a universal guarantee of mutation.

Record input, expected output and observed output with the actual Ruby implementation and version. If no compatible runtime exists on your current platform, label the fragment unexecuted and reason from its semantics rather than claiming a successful run. Run a second isolated experiment that changes only the mechanism under investigation; preserve the exact diagnostic while removing private data.

## Ruby — Expanded practice workbook

### Create a reproducible input
Use a throwaway file `count_names.rb`, not the greeting-only example. Its data deliberately mixes whitespace, case differences and `nil`, so a naive `group_by` will miss real cases:

~~~ruby
records = [" Ada ", "Lin", nil, "ada", " "]
counts = records.compact.map(&:strip).reject(&:empty?).map(&:downcase).tally
raise "bad counts" unless counts == {"ada" => 2, "lin" => 1}
p counts
~~~

Run `ruby count_names.rb`. The expected mapping is `{"ada"=>2, "lin"=>1}`; the fixture was also run successfully with an available Ruby interpreter. `compact` removes nil, `strip` removes surrounding whitespace, `reject` discards blank strings and `tally` counts equal normalized values. Changing the order of those operations can turn a blank entry into an unwanted key or cause a nil receiver error.

### Compare mutation and new objects
`map` constructs a new Array; `map!` mutates its receiver. Create `original = [" Ada "]`, run `original.map(&:strip)` and verify that `original.first` still includes spaces. Repeat with `map!` on an independently initialized array; now the receiver changes. Do not benchmark mutation as intrinsically faster without measuring allocations and correctness.

### A failure that teaches contract design
Remove `compact` and observe `NoMethodError` when `strip` receives nil. Then add a numeric element to test whether the data contract accepts only strings. Decide whether to reject invalid records with a descriptive error or transform them deliberately; silently calling `to_s` may obscure a data import defect.

### Further lab
Use `minitest/autorun` to assert the normal map, the all-blank input (`{}`), an empty list, and a mixed-case Unicode name. Ruby `downcase` is not a universal locale-specific identity algorithm; explain potential internationalization differences. Record the Ruby version and the assertion results. Reference: https://ruby-doc.org/core/Enumerable.html

## Ruby — Practical runnable code lab

### How to run the samples

These independent samples use the appropriate language toolchain. Representative command: `ruby {file}`. Replace placeholders with the actual filename, keep test data isolated, and do not interpret this as automatic installation.


## Ruby — Focused mastery pathway

### Expected behavior
Parse UTF-8 CSV records with id, category and count. Correctly handle quoted commas and nonnegative integer counts. Reject a duplicate ID, missing values, reordered headers and decimal or negative quantities. Aggregate per category and sort the result; keep the parser independent of file handling.

### Runnable Ruby example
Save as ruby_lab.rb. Run ruby -c ruby_lab.rb, then ruby ruby_lab.rb. CSV and StringIO are standard libraries and no real files are read or written.

~~~ruby
require 'csv'
require 'stringio'

def summarize(input)
  totals = Hash.new(0)
  seen = {}
  csv = CSV.new(input, headers: true)
  csv.each.with_index(2) do |row, line|
    raise ArgumentError, "row #{line}: bad header" unless row.headers == %w[id category count]
    raise ArgumentError, "row #{line}: malformed" if row.fields.length != 3 || row.fields.any?(&:nil?)
    id, category, count = row.fields
    raise ArgumentError, "row #{line}: duplicate/empty ID" if id.empty? || seen.key?(id)
    raise ArgumentError, "row #{line}: category" if category.strip.empty?
    raise ArgumentError, "row #{line}: count" unless count.match?(/\A(?:0|[1-9][0-9]*)\z/)
    seen[id] = true
    totals[category] += Integer(count, 10)
  end
  raise ArgumentError, 'missing or reordered header' unless csv.headers == %w[id category count]
  totals.sort.to_h
end

def rejected?(s)
  summarize(StringIO.new(s))
  false
rescue ArgumentError, CSV::MalformedCSVError
  true
end

sample = "id,category,count\na1,\"red,green\",2\na2,blue,3\n"
raise unless summarize(StringIO.new(sample)) == { 'blue' => 3, 'red,green' => 2 }
raise unless summarize(StringIO.new("id,category,count\n")) == {}
[
  "id,category,count\na1,blue,-1\n",
  "id,category,count\na1,blue,2\na1,blue,3\n",
  "id,category,count\na1,blue,2.0\n",
  "id,category,count\na1,blue\n",
  "id,category,count\na1,,2\n",
  "category,id,count\nblue,a1,2\n"
].each { |fixture| raise "bad fixture accepted: #{fixture}" unless rejected?(fixture) }
original = %w[beta alpha]
result = original.map(&:upcase)
raise if original != %w[beta alpha] || result != %w[BETA ALPHA]
puts 'PASS: CSV, duplicate IDs, strict counts, non-mutating Enumerable'
~~~

### Language details worth understanding
CSV.new supports incremental iteration rather than reading every row into one array. Hash.new(0) gives numeric zero for missing category totals, but not validation of blank categories. A seen hash makes duplicate detection easy but scales with unique IDs. Integer(count,10) follows a strict lexical check: parsing must not accept strings such as 2.0 or -1 as a valid count. Ruby's map produces a new array; map! mutates the receiver. The test demonstrates the difference rather than just stating it.

### Bounded investigations
1. Add a quoted newline to one category and compare CSV record numbering with physical source lines.
2. Repeat the six invalid cases; add empty input and confirm both header validation and aggregate output.
3. Process 100,000 synthetic rows through CSV.foreach and compare peak memory with CSV.read; explain the retained seen IDs.
4. Temporarily swap map for map! and demonstrate mutation, then restore the nonmutating API. Add a failing write adapter and prove it cannot report success.

**Evidence:** syntax check, PASS output, six documented rejections, a sorted aggregate and a memory explanation.

## Ruby — Technical notes and common pitfalls

### Core knowledge

1. Blocks are important for iterators and resource-scoped patterns.
2. Symbols and strings differ; distinguish mutable objects from immutable values.
3. Exceptions should not hide failures that a caller needs to handle.
