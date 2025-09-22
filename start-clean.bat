@echo off
echo Limpiando procesos de Node.js...

REM Matar todos los procesos de Node.js
taskkill /f /im node.exe >nul 2>&1

REM Esperar un segundo
timeout /t 1 /nobreak >nul

echo Iniciando servidor...
node main.js
