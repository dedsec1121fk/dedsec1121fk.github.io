# Observe an executable's structure without executing unknown code

## Choose the right host tool
Linux ELF binaries can be inspected with `file`, `readelf -h`, `readelf -S` and `readelf -s` without running the target. `objdump -p` can show dynamic dependencies when supported. On Windows PE executables, use a trusted PE inspection tool to read the DOS/PE signatures, image headers, sections and import table. A Linux `readelf` command is not a parser for PE files; format selection matters.

~~~sh
file ./known-good-sample
readelf -h ./known-good-sample
readelf -S ./known-good-sample
readelf -d ./known-good-sample 2>/dev/null || true
sha256sum ./known-good-sample
~~~

## Questions a section table can answer
A section header has a name, type, file offset, size and flags; file offsets differ from runtime virtual addresses. A program may be stripped of symbols yet remain executable. An imported library's presence suggests a dependency, not proof that a particular function executes in every run. The entry address is a starting point for analysis, not a guarantee of the first user-written source statement.

## Work with a sample you compiled
Build a two-function C program in a disposable directory, once with debugging information and once stripped. Compare section and symbol listings while leaving the source unchanged. Explain which names disappear and what machine-level structure remains. Keep compiler version and build flags in the report; differences may be toolchain-dependent.

## Safety and evidence
Don't upload proprietary binaries or third-party malware to public scanning services without permission. Avoid running an unknown binary. Record original SHA-256, CPU architecture, executable format and exactly which command produced each observation. If a field cannot be explained from the headers, label it a hypothesis requiring more evidence.

## File offsets, RVAs and virtual addresses are separate coordinates
A disassembler may display a loaded virtual address while a hex viewer displays a file offset. In PE, an RVA is relative to the image base. Mapping an RVA to file bytes requires the matching section and validation against its raw data extent; a zero-filled virtual tail need not exist in the file. In ELF, loader behavior is described by program headers, while section headers describe organization useful for linking and analysis. A section name alone is not an execution guarantee.

## Compare a native object and an executable you compile yourself
On Linux with a C compiler and binutils, save `int answer(void) { return 42; }` as `sample.c`. Compile `cc -c sample.c -o sample.o` and inspect `readelf -h sample.o`, `readelf -s sample.o` and `objdump -d sample.o`. This is a relocatable object, not a runnable program: there is no required main function or process entry point. Record the declared machine architecture and the symbol named answer.

Now add a main function in a separate disposable source file and link an executable. Compare program headers and relocation information without assuming identical addresses across builds. Optimization can inline or eliminate functions; stripping can remove names without removing executable behavior. Preserve compile flags beside the hash so the comparison has a reproducible basis.

Format reference: [Microsoft PE specification](https://learn.microsoft.com/en-us/windows/win32/debug/pe-format).
## Virtual addresses are not automatically file offsets

An address shown by a disassembler can refer to a loaded virtual address space, while a hex editor uses file offsets. Converting between them requires the relevant section or segment mapping. Subtracting an image base alone is not a universal file-offset formula.

Some mapped memory, such as zero-initialized data, has no corresponding stored payload bytes. Validate that an address lies inside the file-backed portion before reading. The fictional mapping below deliberately separates virtual size from stored size; it is a model, not a parser for every ELF or PE variation.

```python
def mapped_offset(address, virtual_start, file_start, stored_size, virtual_size):
    delta=address-virtual_start
    if delta < 0 or delta >= virtual_size: return None
    if delta >= stored_size: return None
    return file_start+delta
assert mapped_offset(0x1010,0x1000,0x200,0x40,0x80) == 0x210
assert mapped_offset(0x1060,0x1000,0x200,0x40,0x80) is None
assert mapped_offset(0x0fff,0x1000,0x200,0x40,0x80) is None
print("file-backed range checked")
```

Check bounds against the actual file length after conversion. Different format fields may use relative virtual addresses, absolute addresses or offsets; label them explicitly in notes. Load-time relocation and address randomization add another mapping layer when comparing runtime observations.

[Technical reference](https://refspecs.linuxfoundation.org/elf/gabi4+/ch5.pheader.html)
