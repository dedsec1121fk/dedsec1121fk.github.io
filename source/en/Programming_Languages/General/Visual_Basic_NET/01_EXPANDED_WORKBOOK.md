# VB.NET — parse and validate a port independently

## Build a typed CLI function

~~~vb
Imports System
Module Program
    Function ParsePort(text As String) As Integer
        Dim value As Integer
        If Not Integer.TryParse(text, value) OrElse value < 1 OrElse value > 65535 Then
            Throw New ArgumentException("invalid port")
        End If
        Return value
    End Function
    Sub Main()
        Console.WriteLine(ParsePort("8080"))
    End Sub
End Module
~~~

With a compatible .NET SDK, the predicted output is 8080. Integer.TryParse checks whether text can represent an integer, while the additional comparisons enforce a network-port domain. OrElse short-circuits evaluation.

## Negative tests

Test "", "abc", "0", "-1", "65536" and "65535", expecting ArgumentException for the first five and success for the last. Avoid the older Val function for untrusted strings because it may accept valid prefixes and discard trailing junk.

## Observe a compile-time error

Temporarily return a String while the function declares Integer. Compile with suitable options and inspect the type complaint. Compare static type validation to the runtime exception caused by a well-typed but out-of-range integer. Keep dotnet --info and actual run results; this sample has not been built in .NET during the audit.

## Make the input boundary explicit
TryParse uses the culture and integer parsing rules of its overload. When parsing data from an external protocol rather than a human form, select the expected number style and culture explicitly. For example, leading and trailing whitespace may or may not be acceptable according to your contract, even if the parser can handle them. Build a test table with " 8080 ", "+8080", "08080" and a non-ASCII digit to identify your policy. Keep rejection of malformed text distinct from authorization to use a port: a valid port number does not imply the application is permitted to connect to the destination. Run tests for both lower and upper boundary and capture the exact .NET target framework.
