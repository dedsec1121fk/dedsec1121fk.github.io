# Knowledge depth and bilingual parity gate

This document covers the existing Keep Programming Alive archive and the website data overlays. The archive and the website must describe the same lesson under the same original record identity; do not create replacement pages or alter record IDs to hide a short lesson.

## Local workflow (no GitHub Actions minutes)

From the Test repository root:

~~~sh
python3 scripts/export_developer_mind.py
python3 scripts/audit_knowledge.py
python3 scripts/audit_knowledge_depth.py
python3 scripts/audit_knowledge_depth.py --strict
~~~

The exporter regenerates Markdown from data/en.js, data/el.js and the lesson-expansions-*.js files. Each overlay must be loaded before apply-lesson-expansions.js in the website index. The depth audit checks that overlays exist in the index, that patched Markdown matches the rendered body, and that code fences are balanced.

## How to interpret the report

under_threshold counts Markdown bodies shorter than 1,500 characters; it is a triage signal, not proof that a longer lesson is useful. without_code_fences flags missing executable examples for review, not a universal requirement for glossary entries. repeated_paragraph_groups identifies substantial verbatim repetition across lessons. --strict intentionally fails until the backlog is genuinely cleared.

## Editorial acceptance criteria

Every revised lesson needs topic-specific reasoning, a concrete worked example, failure behavior, and an independent exercise. English and Greek must preserve the same technical claims and example results, without mechanical filler. Test executable samples locally when the runtime is available; explicitly label those not run. Keep production untouched until full browser and content regression testing is complete.

## Repair discipline for the October 2026 glossary pass
Glossary entries are not exempt from real teaching quality. Pointer, Cancellation, Side Effect, Validation, Environment Variable and Virtual Environment now use self-contained boundary tests rather than boilerplate investigation prompts. The corresponding existing source Markdown and the locale/path-specific website overlays must be edited together; preserve both original IDs. Run each C/Python example independently. The Pointer C11 fixture can be compiled with GCC address/undefined sanitizers; cancellation tests use deterministic asyncio Events rather than sleeps; filesystem writers are deliberately injected as test doubles. The virtual-environment script **must not** be saved as venv.py, because that shadows Python's venv standard library. These are per-example local tests, not a claim that all 957 bilingual lesson pairs or the browser are complete.

When editing scripts or website JavaScript, update English and Greek maintenance documentation **in the same commit** to satisfy the existing scripts/validate.py change gate. Do not amend or rewrite unrelated historical commits merely to manufacture passing history. Every new review needs its own source parity, overlay duplicate-key scan, runtime evidence and eventual full-checkout regression.

## Curated language exercise repair — 18 October 2026

Eight existing exercise pairs were rewritten individually: Cython, LLVM IR, XQuery, SPARQL, T-SQL, Nushell, Koka and Hy. Their original indexed identities and offline paths remain unchanged. Both locale bodies are owned by `data/lesson-expansions-exercise-repairs.js`, loaded before the overlay application script, using explicit `replace` and byte-for-byte equivalent archive Markdown (excluding a final newline). Each includes a distinct practical calculation, an observable prediction, a safe failure boundary, version-dependent caveats and further exercises. Code examples requiring uncommon local toolchains are **not claimed as executed**. A length gate, unique `(locale,path)` keys and matched code fences were checked before the commit. This targeted improvement is **not** a declaration that the entire archive passed `--strict`; execute full depth, rendering and real-runtime audits in a complete local checkout before release.

Cython command regression: `cythonize -i cy_lab.pyx` was executed in a disposable directory with Cython 3.2.4, GCC and Python 3; `square(-3)`, `square(0)` and `square(12)` passed. The incorrect `python -m cythonize` invocation was removed from both Markdown locales and the website overlay. This verifies only the small Cython fixture, not all eight toolchains.

## Replacing inherited workbook boilerplate — 18 October 2026

Replaced eight more existing paired workbooks in `lesson-expansions-programming-b.js`: Ruby, C_Sharp, Haskell, Clojure, Dart, GDScript, Elixir, Racket. Their original IDs remain unchanged. The full text in the website replacement overlay now matches the separate Greek and English offline Markdown body; generic baseline greeting and repeated scaffold prose were removed. Each new workbook has a different contract and runnable-language illustration, predicted observations, deliberate failure and extension. Ruby's core normalization/counting fixture was run successfully using the local Ruby interpreter; C#, Haskell, Clojure, Dart, Godot, Elixir and Racket runtime checks remain **not executed** in this environment. No duplicate keys or new knowledge-page identities were added. Strict full-library review remains mandatory before release.

## Template-scaffold regression detection

The depth auditor now separately counts the mechanically inherited generic workbook and three-challenge headings in English and Greek. A page that merely contains a long topic-specific suggestion beneath a shared scaffold is still an editorial backlog item. `--strict` fails until these are replaced with genuinely worked topic-specific teaching; the ordinary audit reports locations without suppressing the whole index. These checks do not auto-create or pad any lessons. The full strict audit has **not been executed in a complete local checkout** during this connected review.

## October 18: paired foundation repairs
Five original foundation topics received new topic-specific tests (Unicode, files, exceptions, modules and algorithms). Archive Markdown retains its prior content with the practical lab appended; the matching overlay has the identical appended text and is loaded before application. This is not a declaration of a fully passing strict audit.

## Foundation extension batch 2 — 18 October
Five further pairs (unit testing, debugging, Git, APIs, security) contain additional individual labs. Old Markdown content remains; the website overlay and new additions have the same text with unique keys. This batch still needs complete-checkout audits and browser verification.

## Programming workbook repairs — 18 October 2026
Replaced six original boilerplate-heavy bilingual workbooks with language-specific worked labs: Crystal, F#, OCaml, Scala 3, Scheme and Common Lisp. Existing `lesson-expansions-programming-b.js` keys/IDs were updated in-place to match Markdown. No extra pages or duplicate overlays were introduced. Rare-language toolchain executions remain unverified until tested on a machine with those compilers.

## Six targeted language exercises — 18 October 2026
Replaced existing generic exercise pairs for Red, Io, Xonsh, Stan, VBScript and QBasic with language-specific labs and safe failure cases. Website replacements and offline Markdown match; scripts are illustrative and no uncommon runtime execution is claimed. Existing page identities remain unchanged. Verify source-archive parity, full strict depth audit and rendered UI before release.

## Six further distinct language exercises — 18 October 2026
The generic exercise pairs for CoffeeScript, ClojureScript, MIPS Assembly, RISC-V Assembly, Standard ML and Wren were replaced with subject-specific tutorials. Offline Markdown and website replacement overlays use identical bodies and old IDs. Language-specific toolchain claims remain unverified until those runtimes are exercised. Production remains untouched.

## Ring exercise (18 October)
Replaced the generic Ring practice sheet in both languages; website and Markdown bodies are identical, with the original record path/ID retained. The dialect-specific runtime remains unverified.
