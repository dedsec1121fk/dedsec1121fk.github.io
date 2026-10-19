# fortran — consolidated language guide

## Fortran

**Typical use:** Scientific and numerical computing.

**Suggested file extension:** `.f90`.

**How to run / environment:** gfortran hello.f90 -o hello && ./hello.

### Starter example

```
program hello
  implicit none
  character(len=*), parameter :: name = 'Ada'
  print *, 'Hello, ', name, '!'
end program hello
```

### How to read it

Use implicit none to catch undeclared variables.

### Common pitfall

Use implicit none to catch undeclared variables.

## Fortran — Expanded practice workbook

### Inspect the smallest source
~~~text
program hello
  implicit none
  character(len=*), parameter :: name = 'Ada'
  print *, 'Hello, ', name, '!'
end program hello
~~~

**Run or compilation context:** gfortran hello.f90 -o hello && ./hello.. Treat this as a baseline: save a copy, confirm the toolchain version and note whether the example merely evaluates a value, prints text, or creates external effects. Production accounts, datasets and hardware must not be used for first attempts.

### Work through the actual mechanism
Implement a pure function over real(kind) arrays with explicit interfaces, verify shapes and run with bounds checking. Compare an array expression with an explicit DO loop.

### Diagnose the sharp edge
Default real precision may lose significant digits; array ordering is column-major and implicit typing can hide misspellings unless implicit none is set.

## Fortran — Practical runnable code lab

### How to run the samples

These independent samples use the appropriate language toolchain. Representative command: `gfortran {file} -o demo && ./demo`. Replace placeholders with the actual filename, keep test data isolated, and do not interpret this as automatic installation.
