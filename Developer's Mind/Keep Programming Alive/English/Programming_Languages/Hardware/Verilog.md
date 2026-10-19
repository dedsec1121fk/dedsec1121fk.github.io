# verilog — consolidated language guide

## Verilog

**Typical use:** Hardware description languages.

**Suggested file extension:** `.v`.

**How to run / environment:** Run with a Verilog simulator such as Icarus Verilog.

### Starter example

```
module hello;
  initial begin
    $display("Hello, Ada!");
    $finish;
  end
endmodule
```

### How to read it

Hardware description is simulated or synthesized, not run like Python.

### Common pitfall

Hardware description is simulated or synthesized, not run like Python.

## Verilog — Expanded practice workbook

### Inspect the smallest source
~~~text
module hello;
  initial begin
    $display("Hello, Ada!");
    $finish;
  end
endmodule
~~~

**Run or compilation context:** Run with a Verilog simulator such as Icarus Verilog.. Treat this as a baseline: save a copy, confirm the toolchain version and note whether the example merely evaluates a value, prints text, or creates external effects. Production accounts, datasets and hardware must not be used for first attempts.

### Work through the actual mechanism
Implement a two-input multiplexer with combinational always @* and simulate all selector/data combinations. Check for unintended latch inference.

### Diagnose the sharp edge
A missing branch in a combinational block can infer storage. Test with X/Z values and distinguish four-state logic from ordinary booleans.

## Verilog — Technical notes and common pitfalls

### Core knowledge

1. Nonblocking and blocking assignment semantics differ, especially in sequential logic.
2. Always construct testbenches with known clock and reset behavior.
3. Simulation success is not necessarily evidence of synthesizability or timing closure.
