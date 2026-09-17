@echo off
cd /d "%~dp0"
echo Launching Study Hub RPG Desktop Application...
start "" "node_modules\electron\dist\electron.exe" "%~dp0."
