$content = Get-Content run_cmd.txt -Raw
$content = $content -replace "`r", ""
$lines = $content -split "`n"
$printing = $false
foreach ($line in $lines) {
    if ($line -match "Exception") {
        $printing = $true
    }
    if ($printing) {
        Write-Host $line
        if ($line -match "^\[INFO\]" -or $line -match "^\[ERROR\]") {
            $printing = $false
        }
    }
}
