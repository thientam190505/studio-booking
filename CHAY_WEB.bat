@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Studio Booking - Khoi chay Web

echo ==================================================
echo   STUDIO BOOKING - KHOI CHAY HE THONG DAT LICH
echo ==================================================

if exist "D:\Antigravity\Tool\NodeJS\node.exe" (
    set "PATH=D:\Antigravity\Tool\NodeJS;%PATH%"
)

where node >nul 2>nul
if errorlevel 1 (
    echo [LOI] Khong tim thay Node.js tren may nay!
    echo Hay cai Node.js LTS (https://nodejs.org) hoac kiem tra D:\Antigravity\Tool\NodeJS
    pause
    exit /b 1
)

if not exist ".env" (
    if exist ".env.example" (
        echo [1/4] Dang tao file cau hinh .env tu .env.example...
        copy /Y ".env.example" ".env" >nul
        echo [LUU Y] Hay dan chuoi PostgreSQL DATABASE_URL that vao file .env truoc khi chay local!
        echo Hoac mo truc tiep ban Web Online: https://studio-booking-one-lovat.vercel.app
        pause
        exit /b 1
    )
)

findstr /C:"USER:PASSWORD@HOST" ".env" >nul
if %errorlevel%==0 (
    echo [LUU Y] File .env van dang de chuoi mau USER:PASSWORD@HOST.
    echo Hay dan chuoi DATABASE_URL PostgreSQL that vao .env, hoac truy cap ban Online:
    echo   https://studio-booking-one-lovat.vercel.app
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo [2/4] Dang cai dat thu vien lan dau (npm install)...
    call npm install
    if errorlevel 1 (
        echo [LOI] Cai thu vien that bai!
        pause
        exit /b 1
    )
)

echo [3/4] Dang dong bo Prisma Client voi PostgreSQL...
call npx prisma generate >nul 2>nul

netstat -ano | findstr ":3000 " | findstr "LISTENING" >nul
if %errorlevel%==0 (
    echo [4/4] Web server dang chay san tai http://localhost:3000
    echo Dang mo trinh duyet cho ban...
    start "" "http://localhost:3000"
    timeout /t 3 >nul
    exit /b 0
)

echo [4/4] Dang bat Web server tai http://localhost:3000 ...
echo Luu y: GIU CUA SO DEN NAY MO trong luc dung web. Tat cua so nay la tat web.
echo.
start "" cmd /c "timeout /t 3 >nul && start http://localhost:3000"
call npm run dev
pause
