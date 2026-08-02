$ErrorActionPreference = "Stop"

if (-not (Test-Path ".\\package.json")) {
    throw "請在 jourdeness-concierge 專案根目錄執行這個腳本。"
}

$required = @(
    ".\\app\\api\\storefront\\site-studio\\route.ts",
    ".\\app\\api\\storefront\\catalog\\route.ts",
    ".\\app\\api\\admin\\products\\[id]\\route.ts",
    ".\\app\\api\\admin\\catalog\\series\\route.ts",
    ".\\lib\\http-json.ts",
    ".\\lib\\storefront-catalog.ts"
)

foreach ($path in $required) {
    if (-not (Test-Path -LiteralPath $path)) {
        throw "缺少必要檔案：$path。請先把 ZIP 內 app 與 lib 複製到專案根目錄。"
    }
}

Remove-Item -Recurse -Force ".\\app\\api\\admin\\series" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force ".\\.next" -ErrorAction SilentlyContinue

Write-Host "必要檔案檢查通過，開始執行 npm run build。" -ForegroundColor Green
& npm run build

if ($LASTEXITCODE -ne 0) {
    throw "npm run build 失敗，請把完整紅色錯誤畫面傳回。"
}

Write-Host "" 
Write-Host "Build 成功。接著執行 npm run dev。" -ForegroundColor Cyan
