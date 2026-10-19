$values = @(4, 7, 11, 16)
$even = $values | Where-Object { $_ % 2 -eq 0 }
Write-Output ("Even values: " + ($even -join ", "))
