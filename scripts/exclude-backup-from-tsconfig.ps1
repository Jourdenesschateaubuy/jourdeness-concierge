$ErrorActionPreference = "Stop"

$tsconfigPath = Join-Path (Get-Location) "tsconfig.json"

if (-not (Test-Path $tsconfigPath)) {
  throw "找不到 tsconfig.json。請在 jourdeness-concierge 專案根目錄執行。"
}

$backupPath = Join-Path (Get-Location) "tsconfig.before-backup-exclude.json"

if (-not (Test-Path $backupPath)) {
  Copy-Item $tsconfigPath $backupPath
  Write-Host "已備份 tsconfig.json -> tsconfig.before-backup-exclude.json" -ForegroundColor Yellow
}

$raw = Get-Content $tsconfigPath -Raw
$config = $raw | ConvertFrom-Json

$exclude = @()

if ($null -ne $config.exclude) {
  $exclude += @($config.exclude)
}

$needed = @(
  "node_modules",
  "backup",
  "backup/**"
)

foreach ($item in $needed) {
  if ($exclude -notcontains $item) {
    $exclude += $item
  }
}

$config | Add-Member -NotePropertyName exclude -NotePropertyValue $exclude -Force

$json = $config | ConvertTo-Json -Depth 100
Set-Content -Path $tsconfigPath -Value $json -Encoding UTF8

Write-Host ""
Write-Host "tsconfig exclude 已更新：" -ForegroundColor Green
$exclude | ForEach-Object {
  Write-Host "  - $_"
}

Write-Host ""
Write-Host "現在執行：" -ForegroundColor Cyan
Write-Host "npx tsc --noEmit"
