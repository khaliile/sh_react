@echo off
rem ============================================================
rem  Study Hub - Start Local TTS Server + App
rem ============================================================
cd /d "%~dp0"

if not exist "tts-env\Scripts\python.exe" (
  echo Setting up Python TTS environment...
  uv venv --python 3.11 --allow-existing tts-env
  uv pip install --python tts-env\Scripts\python.exe "numpy<2" "onnxruntime<=1.17.3" piper-tts fastapi "uvicorn[standard]" groq boto3 python-multipart
  echo.
)

echo [1/3] Starting Piper Local TTS Server on http://127.0.0.1:8100 ...
start "Study Hub Voice Server" /min cmd /c "tts-env\Scripts\python.exe local_tts_server.py"

echo [2/3] Starting AI Backend Server on http://127.0.0.1:8000 ...
start "Study Hub AI Server" /min cmd /c "tts-env\Scripts\python.exe server.py"

rem Give servers 2 seconds to initialize
timeout /t 2 /nobreak >nul

echo [3/3] Starting Vite Dev Server & Electron Desktop Application...
start "Study Hub Dev Server" /min cmd /c "npm run dev"

rem Wait 3 seconds for Vite dev server to bind port 5173
timeout /t 3 /nobreak >nul

set NODE_ENV=development
start "Study Hub Desktop" /min cmd /c "node_modules\electron\dist\electron.exe ."

echo.
echo ============================================================
echo   Study Hub RPG Desktop App is running!
echo   - Desktop Window: Electron (Active)
echo   - Dev Server:     http://localhost:5173
echo   - TTS Server:     http://127.0.0.1:8100
echo   - AI Server:      http://127.0.0.1:8000
echo ============================================================
echo.