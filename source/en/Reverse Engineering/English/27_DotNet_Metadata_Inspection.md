# Managed code still requires format- and runtime-aware inspection

## Use an assembly you built yourself
A .NET assembly often contains CLI metadata describing types, methods and referenced assemblies. Inspection of metadata can reveal declared dependencies without executing the target. Runtime resolution, reflection and dynamic loading may still introduce behavior not obvious from static listings. Avoid assuming that a single assembly file contains all the source code used by an application.

~~~sh
# On a host with .NET SDK:
dotnet --info
# Read-only platform inspection is tool-specific:
file Sample.dll
sha256sum Sample.dll
~~~

## Track references before interpreting code
Record the assembly identity, target framework, architecture where relevant, referenced assemblies and exported public types using an approved metadata browser. Distinguish the logical method name from the compiled IL instruction sequence. An unresolved assembly reference can cause a runtime failure even though the DLL header is structurally valid.

## Controlled experiment
Create a class library with a public method returning a fixed string and a console program referencing it. Build both from source, then rename the referenced DLL in a disposable output directory and observe the loader's diagnostic. Restore the original artifact and verify the expected output. Keep the build configuration so the experiment can be repeated across releases.

## Evidence and limits
Do not upload proprietary assemblies to third-party decompilation services without permission. A decompiler reconstructs an approximation of higher-level code, not necessarily identical source or comments. State tool, metadata token or method location, original hash and which parts are inferred rather than directly observed.
