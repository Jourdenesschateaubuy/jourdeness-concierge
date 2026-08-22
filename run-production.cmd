@echo off
cd /d D:\Jourdeness

set "PATH=D:\Jourdeness\runtime\node;%PATH%"

if not exist "D:\Jourdeness\logs" mkdir "D:\Jourdeness\logs"

echo [%date% %time%] Starting Jourdeness Production >> "D:\Jourdeness\logs\production.log"

call "D:\Jourdeness\runtime\node\npm.cmd" run start >> "D:\Jourdeness\logs\production.log" 2>&1
