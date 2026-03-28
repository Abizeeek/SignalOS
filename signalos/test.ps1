$text = Get-Content compile.log -Raw
$text = $text -replace "`r", ""
$lines = $text -split "`n"
foreach ($line in $lines) {
    if ($line -match "\[ERROR\] .*\.java:") {
        Write-Host $line
    }
}
