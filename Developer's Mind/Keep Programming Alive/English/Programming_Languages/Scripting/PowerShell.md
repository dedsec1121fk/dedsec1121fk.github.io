# powershell — consolidated language guide

## PowerShell

### How the language behaves
PowerShell transports structured objects through pipelines and can access .NET functionality, unlike shells whose pipes are mostly text.

### Source fragment to analyze
```text
1..5 | Where-Object { $_ % 2 -eq 1 } | Measure-Object -Sum
```

### Deliberate exercise
Inspect the Sum property and then send the same pipeline an empty sequence. Determine whether you are holding an object or formatted text.

### Check a failure condition
Formatting commands are for display and often make downstream property access unreliable; retain objects until the end.

Record input, expected output and observed output with the actual PowerShell implementation and version. If no compatible runtime exists on your current platform, label the fragment unexecuted and reason from its semantics rather than claiming a successful run. Run a second isolated experiment that changes only the mechanism under investigation; preserve the exact diagnostic while removing private data.

## PowerShell — Expanded practice workbook

### The task
Count valid statuses from CSV without treating paths as wildcard patterns. PowerShell returns objects, not just arbitrary text streams. Use Import-Csv and validate properties before accessing them as trusted application data.

### Run
Save as report.ps1. Create events.csv with header name,status and rows Ada,ok; Grace,fail; Ada,ok. With PowerShell installed, call ./report.ps1 -Path ./events.csv. Expected output: ok=2; fail=1. Script execution policy and trust configuration depend on the system; do not disable security controls blindly.

~~~powershell
param([Parameter(Mandatory=$true)][string]$Path)
$ErrorActionPreference = "Stop"
if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
    throw "Missing input file"
}
$counts = @{ ok = 0; fail = 0 }
foreach ($row in (Import-Csv -LiteralPath $Path -Encoding utf8)) {
    if ([string]::IsNullOrWhiteSpace($row.name)) {
        throw "Missing name"
    }
    if ($row.status -notin @("ok", "fail")) {
        throw "Invalid status"
    }
    $counts[$row.status] = [int]$counts[$row.status] + 1
}
"ok=$($counts['ok']); fail=$($counts['fail'])"
~~~

### Why these parameters matter
-LiteralPath prevents [ and ] from becoming wildcard patterns. -Encoding utf8 clarifies text interpretation. ErrorActionPreference Stop promotes nonterminating errors, while throw represents a deliberate contract failure. The hashtable stores counts; this sample expects lowercase statuses exactly.

### Challenges
Test an empty file, nonexistent path, missing header, a comma in a quoted name, a status in uppercase and a row with blank name. The sample currently accepts an empty file as zero counts and rejects uppercase status; decide whether that matches the contract. Improve header validation before processing rows.

### Troubleshooting
Verify $PSVersionTable.PSVersion and Get-Command Import-Csv. On Linux/Termux PowerShell might not be installed even though Bash exists. Check file encoding and try a path containing brackets or spaces. Avoid using Invoke-Expression on rows or executing user-controlled CSV fields.
Success: two ok, one fail, no external modules. https://learn.microsoft.com/powershell/module/microsoft.powershell.utility/import-csv

## PowerShell — Practical runnable code lab

### How to run the samples

These independent samples use the appropriate language toolchain. Representative command: `pwsh -File {file}`. Replace placeholders with the actual filename, keep test data isolated, and do not interpret this as automatic installation.


## PowerShell — Focused mastery pathway

### Contract
Produce a sorted CSV with Relative and Bytes columns for ordinary files below a caller-selected directory. Input paths can contain spaces, literal brackets and Unicode. Permission failures should terminate rather than return a deceptively incomplete report. The scanner must never rename or delete input files; the report is explicitly an output artifact stored outside the scanned root.

### Executable PowerShell 7 lab
Save the source as inventory.ps1 and call pwsh -NoProfile -File ./inventory.ps1 -Root './fixture [demo]' -Output './inventory.csv'. Create fixture files first using a throwaway directory. PowerShell 7 with modern .NET is required for GetRelativePath.

~~~powershell
param(
  [Parameter(Mandatory = $true)][string]$Root,
  [Parameter(Mandatory = $true)][string]$Output
)
$ErrorActionPreference = 'Stop'
$dir = (Resolve-Path -LiteralPath $Root -ErrorAction Stop).ProviderPath
if (-not (Test-Path -LiteralPath $dir -PathType Container)) {
    throw 'Root must be a directory'
}
# The output should be OUTSIDE Root to avoid including a previous report.
$records = @(Get-ChildItem -LiteralPath $dir -File -Recurse -ErrorAction Stop |
    Sort-Object -Property FullName |
    ForEach-Object {
        [pscustomobject]@{
            Relative = [System.IO.Path]::GetRelativePath($dir, $_.FullName)
            Bytes    = [int64]$_.Length
        }
    })
if ($records.Count -eq 0) {
    Set-Content -LiteralPath $Output -Value 'Relative,Bytes' -Encoding utf8
} else {
    $records | Export-Csv -LiteralPath $Output -NoTypeInformation -Encoding utf8
}
Write-Output ("PASS: {0} files inventoried" -f $records.Count)
~~~

### What to verify
Run it against an empty folder: the CSV still needs Relative,Bytes headers. Add alpha.txt (3 UTF-8 bytes), a nested file, and a Greek-named file, then open the CSV in a text editor and confirm stable column names and the sizes in **bytes**, not characters. Repeat twice with unchanged inputs: line order should remain stable after Sort-Object. The output location must remain outside the root; otherwise a second run may include the old report.

### Edge cases and diagnostics
1. Rename the fixture directory to include square brackets. -LiteralPath must resolve the exact name; contrast with Get-ChildItem -Path only as a controlled exercise.
2. Pass an absent root or a file instead of a directory; capture the terminating error. Run an inaccessible test folder only where permission controls are available, and do not elevate privileges.
3. Use a read-only test destination and confirm that a failed Export-Csv cannot legitimately emit success. Review what happens if an old report already exists: production tooling should write to a temporary file and rename only after completion.
4. CSV formula injection matters if inventories are opened in spreadsheet applications. Treat untrusted file names as data and document an escaping policy before sharing reports externally.

**Evidence:** sample CSV, UTF-8 verification, a deterministic second run, two handled failures and the observed PowerShell version. Pester tests may automate these checks, but no Pester installation is assumed.

## PowerShell — Technical notes and common pitfalls

### Core knowledge

1. PowerShell pipelines pass objects rather than merely byte streams of text.
2. Use -LiteralPath where path characters should not be treated as wildcards.
3. Avoid Invoke-Expression with untrusted input and review side effects before running cmdlets.
