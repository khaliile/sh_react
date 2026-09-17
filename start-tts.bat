@echo off
cd /d "%~dp0"
set VOICES_DIR=voices
set PYTHONIOENCODING=utf-8
set PYTHONUTF8=1
echo Starting TTS server on port 8100...
echo.
tts-env\Scripts\python.exe local_tts_server.py
pause
