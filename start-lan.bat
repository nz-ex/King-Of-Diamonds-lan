@echo off
cd /d "%~dp0"
echo ========================================
echo King of Diamonds LAN Multiplayer
echo ========================================
echo.

REM Kill existing server
echo [0/4] Clearing old server...
netstat -ano | findstr :3001 >nul && (
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
        taskkill /PID %%a /F >nul 2>&1
    )
    echo    Old server killed.
)

echo [1/4] Finding your WiFi IP...
for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr /i "IPv4" ^| findstr "192"') do (
    set IP=%%i
    set IP=%IP: =%
    goto :found_ip
)
:found_ip
echo 🎮 YOUR IP: %IP%
echo 📱 Share: http://%IP%:5173
echo.

echo [2/4] Starting Server...
start "Server" cmd /k "npm run server"
timeout /t 4 >nul

echo [3/4] Starting Game...
npm run dev -- --host 0.0.0.0

echo [4/4] Ready!
pause
