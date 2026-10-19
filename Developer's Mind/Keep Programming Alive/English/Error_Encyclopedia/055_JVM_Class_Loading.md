# Java/JVM diagnostics: class loading and initialization

## ClassNotFoundException

**Language / environment:** Java

### Meaning
A required class cannot be located at runtime.

### Repair
Check package name, classpath and artifact deployment.

## NoClassDefFoundError

**Language / environment:** Java

### Meaning
A class known at compile time is unavailable or failed initialization at runtime.

### Repair
Inspect runtime dependencies, versions and earlier initialization exception.

## Resolve what the JVM cannot find

ClassNotFoundException is typically raised when application code explicitly asks a class loader for a named class that cannot be located. NoClassDefFoundError can occur when a definition that was available during compilation is unavailable at runtime, or a class has already failed to initialize. The exception names look similar, but the loader context, packaging and the preceding cause matter more than guessing a jar filename.

~~~java
public class Demo {
    public static void main(String[] args) {
        System.out.println("Classpath test");
    }
}
~~~

In a disposable folder, compile Demo.java with the Java compiler matching your environment. Run the class using a classpath containing the compiled output; then compare it with a classpath pointing elsewhere. Write down which directory contains Demo.class, which JVM you launched and whether a package declaration changed the expected path. Do not confuse module-path resolution with classpath resolution on modern Java installations.

## Distinguish missing bytes from failed initialization

If a class exists but its static initializer throws, the first failure can differ from subsequent uses of the class in the same process. Preserve the complete nested cause chain and the earliest exception rather than reporting only the last NoClassDefFoundError line. Never advise downloading arbitrary jars from search results; verify the project's dependency lockfile, source repository and published artifact coordinates.

## Reproduction evidence

Record Java and build tool versions, original class name, deployment archive contents and classpath/module path. If changing packaging resolves the failure, prove it with the identical executable invoked under the corrected path.
