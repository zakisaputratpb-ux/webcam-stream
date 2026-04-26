@echo off
title Webcam Stream + ngrok

echo.
echo ==========================================
echo   WEBCAM STREAM + NGROK LAUNCHER
echo ==========================================
echo.

echo [1/3] Starting Node.js server...
start "Webcam Server" cmd /k "cd /d %~dp0 && npm start"

timeout /t 4 /nobreak >nul

echo [2/3] Starting ngrok tunnel...
echo.
echo Please wait for ngrok to show the link...
echo.

start "ngrok" cmd /k "ngrok http 3000"

echo.
echo ==========================================
echo   IMPORTANT:
echo ==========================================
echo.
echo 1. Wait until ngrok shows the https:// link
echo 2. Copy the link and use it like this:
echo.
echo    Client Page: https://YOUR-LINK.ngrok-free.dev/client
echo    Host Page:   https://YOUR-LINK.ngrok-free.dev/host
echo.
echo 3. Keep both windows open!
echo.
echo ==========================================
echo.
pause