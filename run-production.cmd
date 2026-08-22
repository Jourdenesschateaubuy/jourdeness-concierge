@echo off
cd /d D:\Jourdeness

set "PATH=D:\Jourdeness\runtime\node;%PATH%"

if not exist "D:\Jourdeness\logs" mkdir "D:\Jourdeness\logs"

powershell.exe -NoProfile -Command "if (Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue) { exit 10 } else { exit 0 }"

if %ERRORLEVEL% EQU 10 (
    exit /b 0
)

echo [%date% %time%] Starting Jourdeness Production >> "D:\Jourdeness\logs\production.log"

call "D:\Jourdeness\runtime\node\npm.cmd" run start >> "D:\Jourdeness\logs\production.log" 2>&1
