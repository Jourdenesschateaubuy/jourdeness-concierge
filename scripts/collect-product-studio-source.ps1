$ErrorActionPreference = "Stop"

$projectRoot = (Get-Location).Path

if (-not (Test-Path (Join-Path $projectRoot "package.json"))) {
  throw "請在 jourdeness-concierge 專案根目錄執行。"
}

$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$exportRoot = Join-Path $projectRoot "_product-studio-source-$stamp"
$zipPath = "$exportRoot.zip"

New-Item -ItemType Directory -Path $exportRoot -Force | Out-Null

$patterns = @(
  "product",
  "products",
  "商品"
)

$roots = @(
  "app",
  "lib",
  "components",
  "scripts",
  "configs"
)

$files = @()

foreach ($relativeRoot in $roots) {
  $fullRoot = Join-Path $projectRoot $relativeRoot

  if (-not (Test-Path $fullRoot)) {
    continue
  }

  $files += Get-ChildItem `
    -Path $fullRoot `
    -Recurse `
    -File `
    -Include *.ts,*.tsx,*.js,*.jsx,*.json,*.mjs,*.md `
    -ErrorAction SilentlyContinue |
    Where-Object {
      $path = $_.FullName.ToLowerInvariant()

      (
        $path -match "\\product" -or
        $path -match "\\products" -or
        $_.Name.ToLowerInvariant() -match "product"
      ) -and
      $path -notmatch "\\backup\\" -and
      $path -notmatch "\\node_modules\\" -and
      $path -notmatch "\\.next"
    }
}

$files = $files |
  Sort-Object FullName -Unique

if ($files.Count -eq 0) {
  Write-Host "沒有自動找到 product 相關檔案。" -ForegroundColor Yellow
} else {
  foreach ($file in $files) {
    $relative = $file.FullName.Substring($projectRoot.Length).TrimStart("\")
    $destination = Join-Path $exportRoot $relative
    $destinationDir = Split-Path $destination -Parent

    New-Item -ItemType Directory -Path $destinationDir -Force | Out-Null
    Copy-Item $file.FullName $destination -Force
  }
}

# Always include project metadata that helps understand aliases / dependencies.
$extraFiles = @(
  "package.json",
  "tsconfig.json",
  "next.config.ts",
  "next.config.js",
  "next.config.mjs"
)

foreach ($extra in $extraFiles) {
  $source = Join-Path $projectRoot $extra

  if (Test-Path $source) {
    $destination = Join-Path $exportRoot $extra
    Copy-Item $source $destination -Force
  }
}

$manifestPath = Join-Path $exportRoot "PRODUCT_STUDIO_SOURCE_MANIFEST.txt"

@(
  "Jourdeness Product Studio source collection"
  "Project: $projectRoot"
  "Created: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
  ""
  "Collected source files:"
) | Set-Content $manifestPath -Encoding UTF8

$files |
  ForEach-Object {
    $_.FullName.Substring($projectRoot.Length).TrimStart("\")
  } |
  Add-Content $manifestPath -Encoding UTF8

if (Test-Path $zipPath) {
  Remove-Item $zipPath -Force
}

Compress-Archive `
  -Path (Join-Path $exportRoot "*") `
  -DestinationPath $zipPath `
  -CompressionLevel Optimal

Write-Host ""
Write-Host "Product Studio source collection completed." -ForegroundColor Green
Write-Host ""
Write-Host "ZIP:" -ForegroundColor Cyan
Write-Host $zipPath
Write-Host ""
Write-Host "請把這個 ZIP 上傳到 ChatGPT。" -ForegroundColor Yellow
