param(
    [Parameter(Mandatory=$true)]
    [string]$SourceFile,

    [Parameter(Mandatory=$true)]
    [string]$OriginalName
)

$projectRoot = "D:\Jourdeness"
$targetDir = Join-Path $projectRoot "public\products"
$targetFile = Join-Path $targetDir $OriginalName

if (-not (Test-Path $SourceFile)) {
    Write-Host "SOURCE FILE NOT FOUND" -ForegroundColor Red
    Write-Host $SourceFile
    exit 1
}

New-Item -ItemType Directory -Path $targetDir -Force | Out-Null

Copy-Item `
    -LiteralPath $SourceFile `
    -Destination $targetFile `
    -Force

if (Test-Path $targetFile) {
    Write-Host ""
    Write-Host "SYNC OK" -ForegroundColor Green
    Write-Host "Source :" $SourceFile
    Write-Host "Target :" $targetFile
    Write-Host ""
    Write-Host "Next step:"
    Write-Host "git add `"public/products/$OriginalName`""
    Write-Host "git commit -m `"publish: add $OriginalName`""
    Write-Host "git push origin main"
}
else {
    Write-Host "SYNC FAILED" -ForegroundColor Red
    exit 1
}
