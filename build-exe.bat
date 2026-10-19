@echo off
echo ===================================================
echo   Greeting Cards & Gift POS - Windows EXE Builder
echo ===================================================
echo.
echo [1/3] Installing dependencies...
call npm install
echo.
echo [2/3] Building production web assets with Vite...
call npm run build
echo.
echo [3/3] Packaging into Windows NSIS EXE with Electron Builder...
call npx electron-builder --win nsis
echo.
echo ===================================================
echo   Build Complete!
echo   Your Windows installer is in the "dist-exe" folder:
echo   GreetingCardsPOS-Setup.exe
echo ===================================================
pause
