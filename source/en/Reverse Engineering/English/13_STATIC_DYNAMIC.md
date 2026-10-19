# Static versus dynamic analysis: separate observation from execution

## Model and limits of inference
Static analysis examines bytes and structure without running the sample; dynamic analysis observes selected behavior under controlled execution. Each has blind spots. A string in a binary is not proof that a path executes; one dynamic run cannot establish every possible branch. Keep hypotheses, evidence, and confidence separate.

## Self-contained authorized fixture
~~~python
import ast
source = """def choose(flag):
    if flag:
        return "red"
    return "blue"
"""
tree = ast.parse(source)
names = [n.name for n in ast.walk(tree) if isinstance(n, ast.FunctionDef)]
assert names == ["choose"]  # static finding
space = {}
exec(compile(tree, "<owned-toy-source>", "exec"), space)
assert space["choose"](True) == "red"
assert space["choose"](False) == "blue"
~~~

## Investigation and verification
Only execute code you own or have vetted. For unfamiliar binaries favor static review and isolated environments with no real credentials, limited network access and disposable data. Record which static structures exist and which were exercised during dynamic testing. Coverage is evidence about tested paths, not a guarantee about every path.

## Hands-on lab
Add a third branch to the toy function and intentionally test only two branches. Produce a table listing structural possibilities versus observed outputs. Explain how a hidden side effect could be missed by static names-only inspection.

## A coverage matrix, not a single demonstration
Use an owned three-branch parser with input kinds `valid`, `empty`, and `malformed`. Static inspection should list all three branches and their possible outputs. Dynamic tests initially covering only valid and empty inputs provide evidence for two outcomes, not proof about malformed input. Add the third fixture and compare. Static analysis can miss behavior supplied by reflection or external configuration; dynamic analysis sees only triggered paths. State environmental variables, file inputs and versions for every observed run, and never execute untrusted samples outside an authorized controlled lab.
