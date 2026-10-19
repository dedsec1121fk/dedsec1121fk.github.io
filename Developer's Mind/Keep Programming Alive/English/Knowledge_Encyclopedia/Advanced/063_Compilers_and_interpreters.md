# Compilers and interpreters: parsing before execution

## Mental model

A compiler translates one representation into another: source code into bytecode, an intermediate representation, or machine instructions. An interpreter evaluates a representation. Real implementations combine the two. For example, CPython parses and compiles a module into bytecode before executing that bytecode with its virtual machine. A JavaScript runtime may interpret a function first and later optimize frequently executed code.

The pipeline can be divided into tokenization, parsing, semantic analysis, intermediate representation, optimization and execution or artifact generation. A syntax error means the parser cannot form the requested structure; a missing name may instead be detected by semantic analysis or at runtime, depending on the language.

## Reproducible precedence experiment

The expression 2 + 3 * 4 has an addition node at the root and a multiplication node on its right. Parentheses in (2 + 3) * 4 make multiplication the root. The results are 14 and 20 respectively.

~~~python
import ast

normal = ast.parse("2 + 3 * 4", mode="eval")
grouped = ast.parse("(2 + 3) * 4", mode="eval")

assert isinstance(normal.body.op, ast.Add)
assert isinstance(normal.body.right.op, ast.Mult)
assert isinstance(grouped.body.op, ast.Mult)
assert isinstance(grouped.body.left.op, ast.Add)

try:
    ast.parse("2 + * 3", mode="eval")
except SyntaxError:
    pass
else:
    raise AssertionError("Expected syntax error")

print(ast.dump(normal, indent=2))
~~~

Save the code as parse_lab.py and run python3 parse_lab.py. It inspects the syntax tree without executing the input expression. The negative test confirms that malformed syntax is rejected before any program logic runs.

## Debugging by compilation stage

If a diagnostic reports an unexpected token, reduce the input and inspect earlier delimiters and operators. If it reports an unknown name, ask whether name resolution occurs at compile time or execution time. If the compiler emits object files but the linker fails, inspect symbol definitions and linking flags. If the program builds but crashes, focus on runtime state and inputs instead of the parser.

## Independent challenge

Write a recursive evaluator that accepts only integer literals, addition and multiplication from Python AST nodes. Reject function calls, names and attribute access. Check the two precedence expressions and a deliberately rejected function call. Explain why a syntax tree is a useful intermediate form but not a guarantee that a program is safe.

**Reference:** https://docs.python.org/3/library/ast.html
