@echo off
cd /d D:\Jourdeness
set PATH=D:\Jourdeness\runtime\node;%PATH%
npx.cmd tsx scripts\run-media-publisher.ts
