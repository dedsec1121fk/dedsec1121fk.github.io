# UnsupportedClassVersionError — bytecode target versus active JVM

## What the failure actually means
Java class files contain a header beginning with the magic bytes CAFEBABE, a two-byte minor version and a two-byte major version. If an older JVM tries to load bytecode created for a newer Java release, it can throw UnsupportedClassVersionError. For example, class file major 61 represents Java 17 and major 65 represents Java 21. A project's compile step passing does not establish that its deployment JVM understands the resulting bytecode.

## Controlled solution
This portable probe reads byte arrays without executing untrusted class files. It checks the class file magic and major-version field, including an intentionally invalid magic header. It is not a complete parser or security validator, but it teaches which bytes a version diagnostic concerns.

## Source example
Save this as ClassVersionLab.java.

~~~java
import java.io.ByteArrayInputStream;
import java.io.DataInputStream;
import java.io.IOException;
public class ClassVersionLab {
    static int major(byte[] bytes) throws IOException {
        try (DataInputStream input = new DataInputStream(new ByteArrayInputStream(bytes))) {
            if (input.readInt() != 0xCAFEBABE) throw new IOException("not a class file");
            input.readUnsignedShort(); // minor class-file version
            return input.readUnsignedShort();
        }
    }
    public static void main(String[] args) throws Exception {
        byte[] java17 = {(byte) 0xCA, (byte) 0xFE, (byte) 0xBA, (byte) 0xBE, 0, 0, 0, 61};
        byte[] java21 = {(byte) 0xCA, (byte) 0xFE, (byte) 0xBA, (byte) 0xBE, 0, 0, 0, 65};
        if (major(java17) != 61 || major(java21) != 65) throw new AssertionError();
        try {
            major(new byte[]{0, 0, 0, 0, 0, 0, 0, 65});
            throw new AssertionError("invalid class accepted");
        } catch (IOException expected) {
            if (!expected.getMessage().contains("class file")) throw new AssertionError();
        }
        System.out.println("PASS: Java 17/21 class versions and invalid magic");
    }
}
~~~

## Why this design works
Run javac ClassVersionLab.java && java ClassVersionLab on a JVM capable of compiling this file (tested with Java 21). A real jar can be inspected without running it: use javap -verbose -classpath app.jar fully.qualified.ClassName to see its major version, or inspect one .class safely with a standard binary viewer. Avoid assuming the name of a jar proves compatibility.

## Reproduce the diagnosis safely
If deploying to Java 17, compile source and dependencies for that baseline, e.g. javac --release 17 Source.java when supported. The --release flag controls APIs available to the compiler as well as bytecode target; -source and -target alone can permit accidental references to newer APIs. Third-party dependencies also have their own class file targets, so inspect them separately. Verify java -version on the actual service host, container or Android-compatible runtime, not only on the developer laptop.

## Practice and expected evidence
Document exact compiler version, runtime version, the major version of the failing class and the earliest version required. Do not download random precompiled bytecode tools to bypass version checks. If a newer runtime cannot be installed, rebuild from compatible source and dependencies rather than editing major bytes in the header: changing the number does not backport newer bytecodes or library APIs.

**Authoritative reference:** https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-4.html
