@echo off
cd /d "%~dp0"
set PYTHONIOENCODING=utf-8
set PYTHONUTF8=1
echo =========================================================
echo Starting AI Voice Coach FastAPI Backend on port 8000...
echo STT: Groq whisper-large-v3
echo LLM: Groq llama-3.1-8b-instant
echo =========================================================
echo.

if exist "tts-env\Scripts\python.exe" (
    tts-env\Scripts\python.exe server.py
) else (
    python server.py
)
pause
