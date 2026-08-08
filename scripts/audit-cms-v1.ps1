$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "Jourdeness CMS v1 Audit" -ForegroundColor Cyan
Write-Host "=======================" -ForegroundColor Cyan

$root = Get-Location

Write-Host ""
Write-Host "[1] Project root" -ForegroundColor Yellow
Write-Host $root.Path

Write-Host ""
Write-Host "[2] Git status" -ForegroundColor Yellow
git status -sb

Write-Host ""
Write-Host "[3] Current branch / commit" -ForegroundColor Yellow
git branch --show-current
git rev-parse --short HEAD

Write-Host ""
Write-Host "[4] TypeScript check" -ForegroundColor Yellow
npx tsc --noEmit
$tsExit = $LASTEXITCODE

Write-Host ""
Write-Host "[5] Legacy / backup TSX files" -ForegroundColor Yellow
Get-ChildItem -Path . -Recurse -File -Include *.ts,*.tsx `
  -ErrorAction SilentlyContinue |
  Where-Object {
    $_.FullName -match "\\backup\\" -or
    $_.Name -match "before|backup|old|copy"
  } |
  Select-Object FullName

Write-Host ""
Write-Host "[6] Studio modules" -ForegroundColor Yellow
$paths = @(
  "app\admin\homepage-studio",
  "app\admin\website-studio",
  "app\admin\website-studio\settings",
  "app\admin\website-studio\navigation",
  "app\admin\website-studio\banner",
  "app\admin\website-studio\media",
  "lib\cms"
)

foreach ($path in $paths) {
  if (Test-Path $path) {
    Write-Host "OK  $path" -ForegroundColor Green
  } else {
    Write-Host "MISS $path" -ForegroundColor Red
  }
}

Write-Host ""
Write-Host "[7] Key migration scripts" -ForegroundColor Yellow
Get-ChildItem -Path ".\scripts" -File -ErrorAction SilentlyContinue |
  Where-Object {
    $_.Name -match "homepage|website-settings|navigation|banner|media"
  } |
  Select-Object Name

Write-Host ""
Write-Host "Audit finished." -ForegroundColor Cyan

if ($tsExit -ne 0) {
  Write-Host ""
  Write-Host "TypeScript still has errors. Do NOT delete files yet." -ForegroundColor Red
  exit $tsExit
}
