# systemverilog — consolidated language guide

## SystemVerilog

**Typical use:** Hardware description languages.

**Suggested file extension:** `.sv`.

**How to run / environment:** Run with a SystemVerilog-capable simulator.

### Starter example

```
module hello;
  initial begin
    string name = "Ada";
    $display("Hello, %s!", name);
    $finish;
  end
endmodule
```

### How to read it

Includes richer types and verification constructs than Verilog.

### Common pitfall

Includes richer types and verification constructs than Verilog.

## SystemVerilog — Expanded practice workbook

### Inspect the smallest source
~~~text
module hello;
  initial begin
    string name = "Ada";
    $display("Hello, %s!", name);
    $finish;
  end
endmodule
~~~

**Run or compilation context:** Run with a SystemVerilog-capable simulator.. Treat this as a baseline: save a copy, confirm the toolchain version and note whether the example merely evaluates a value, prints text, or creates external effects. Production accounts, datasets and hardware must not be used for first attempts.

### Work through the actual mechanism
Construct an always_ff @(posedge clk) register and a testbench with assertions. Demonstrate the difference between blocking and nonblocking assignment in a sequential process.

### Diagnose the sharp edge
Do not interpret simulated delta-cycle ordering as hardware propagation delay. Run lint and simulator diagnostics before checking synthesis results.

## SystemVerilog — Focused mastery pathway

### Applied exercises

1. Describe a register that updates on a clock edge using a simulator.
2. Create a testbench with known initial values and input sequences.
3. Check timing assumptions and distinguish simulation from physical synthesis.

- Does this describe hardware concurrency rather than sequential software?
- Which exact runtime, compiler, host, and version does the reference need?
- What is the smallest working program and what side effects does it have?
- How do syntax, logic, and environment errors differ?
- How can invalid inputs be tested without modifying real user files?

## VHDL

**Typical use:** Hardware description languages.

**Suggested file extension:** `.vhd`.

**How to run / environment:** Compile and simulate with GHDL or equivalent.

### Starter example

```
entity hello is end entity;
architecture demo of hello is
begin
  process begin
    report "Hello, Ada!";
    wait;
  end process;
end architecture;
```

### How to read it

Signals and concurrency are key to hardware modeling.

### Common pitfall

Signals and concurrency are key to hardware modeling.

## VHDL — Expanded practice workbook

### Inspect the smallest source
~~~text
entity hello is end entity;
architecture demo of hello is
begin
  process begin
    report "Hello, Ada!";
    wait;
  end process;
end architecture;
~~~

**Run or compilation context:** Compile and simulate with GHDL or equivalent.. Treat this as a baseline: save a copy, confirm the toolchain version and note whether the example merely evaluates a value, prints text, or creates external effects. Production accounts, datasets and hardware must not be used for first attempts.

### Work through the actual mechanism
Build a D flip-flop entity and testbench with rising_edge(clk); verify reset, normal capture and stable output between edges.

### Diagnose the sharp edge
Signals update through scheduled events; variable assignments behave differently. A simulated design is not necessarily synthesizable.
