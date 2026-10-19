# object_pascal_delphi — consolidated language guide

## Object Pascal / Delphi

**Typical use:** Historical and enterprise languages.

**Suggested file extension:** `.pas`.

**How to run / environment:** Compile in Delphi or Free Pascal Lazarus.

### Starter example

```
program Hello;
{$APPTYPE CONSOLE}
begin
  Writeln('Hello, Ada!');
end.
```

### How to read it

Delphi extends Pascal with units/classes and GUI tooling.

### Common pitfall

Delphi extends Pascal with units/classes and GUI tooling.

## Object_Pascal_Delphi — Expanded practice workbook

### Inspect the smallest source
~~~text
program Hello;
{$APPTYPE CONSOLE}
begin
  Writeln('Hello, Ada!');
end.
~~~

**Run or compilation context:** Compile in Delphi or Free Pascal Lazarus.. Treat this as a baseline: save a copy, confirm the toolchain version and note whether the example merely evaluates a value, prints text, or creates external effects. Production accounts, datasets and hardware must not be used for first attempts.

### Work through the actual mechanism
Define a class with a constructor/destructor, add an owned collection and verify cleanup under an exception path. Compare Free with FreeAndNil in a controlled example.

### Diagnose the sharp edge
Object ownership and ARC/managed types differ across targets. Do not assume visual form events always free objects automatically.

## Object_Pascal_Delphi — Focused mastery pathway

### Learn the memory and execution model
Create a Delphi/Free Pascal class with constructor and destructor and document ownership of an allocated instance.

### Deliberate failure and corrective experiment
Place objects in an owning collection and deliberately raise an exception during population; test cleanup through try/finally and compare Free with FreeAndNil.

### Independent engineering assignment
Build a local text-file catalog using classes and stable UTF-8 reading, with a test for invalid input and deterministic sorting. Identify compiler/RTL differences between Delphi and Free Pascal.
