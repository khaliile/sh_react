/**
 * main.cjs — Study Hub RPG · Electron Main Process
 *
 * Responsibilities:
 *  1. Create the BrowserWindow and load the local Vite-built index.html
 *     (or the Vite dev server in development).
 *  2. Strictly block ALL external navigation / new-window requests so the
 *     app can never open Microsoft Edge or any other browser.
 *  3. Spawn the local Python TTS server (local_tts_server.py) inside
 *     tts-env as a hidden background child process on launch, and safely
 *     kill it (including child PIDs) when the app exits.
 */

'use strict';

const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { spawn, execSync } = require('child_process');

// ─── TTS server state ────────────────────────────────────────────────────────

const TTS_PORT = 8100;
const TTS_HEALTH_URL = `http://127.0.0.1:${TTS_PORT}/health`;
let ttsProcess = null;

/** Quick HTTP health-check; resolves false on any error. */
async function isTtsRunning() {
  try {
    const res = await fetch(TTS_HEALTH_URL, {
      signal: AbortSignal.timeout(1500),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Poll until TTS is healthy or timeout expires. */
async function waitForTtsReady(timeoutMs = 60_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await isTtsRunning()) return true;
    await new Promise((r) => setTimeout(r, 800));
  }
  return false;
}

/**
 * Resolve python executable and server script paths.
 * Packaged:  process.resourcesPath / tts-env / Scripts / python.exe
 * Dev:       __dirname            / tts-env / Scripts / python.exe
 */
function getTtsPaths() {
  const base = app.isPackaged ? process.resourcesPath : __dirname;
  return {
    pythonExe: path.join(base, 'tts-env', 'Scripts', 'python.exe'),
    serverScript: path.join(base, 'local_tts_server.py'),
    voicesDir: path.join(base, 'voices'),
  };
}

/**
 * Spawn the TTS server with output capture for diagnostics.
 * Implements automatic retry with exponential backoff.
 * Returns true if the process was started, false if skipped / failed.
 */
function spawnTtsServer() {
  const { pythonExe, serverScript, voicesDir } = getTtsPaths();

  if (!fs.existsSync(pythonExe)) {
    console.warn('[TTS] python.exe not found at:', pythonExe);
    return false;
  }
  if (!fs.existsSync(serverScript)) {
    console.warn('[TTS] server script not found at:', serverScript);
    return false;
  }

  try {
    ttsProcess = spawn(pythonExe, [serverScript], {
      cwd: path.dirname(serverScript),
      env: {
        ...process.env,
        VOICES_DIR: voicesDir,
        PYTHONIOENCODING: 'utf-8',
        PYTHONUTF8: '1',
        // Force unbuffered output so we see logs immediately
        PYTHONUNBUFFERED: '1',
      },
      // Capture stdout/stderr so we can diagnose startup issues
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
      detached: false,
    });

    // Log server output for diagnostics
    if (ttsProcess.stdout) {
      ttsProcess.stdout.on('data', (data) => {
        const msg = data.toString().trim();
        if (msg) console.log(`[TTS stdout] ${msg}`);
      });
    }
    if (ttsProcess.stderr) {
      ttsProcess.stderr.on('data', (data) => {
        const msg = data.toString().trim();
        if (msg) console.warn(`[TTS stderr] ${msg}`);
      });
    }

    ttsProcess.on('exit', (code, signal) => {
      console.log(`[TTS] Server exited: code=${code}, signal=${signal}`);
      ttsProcess = null;
      
      // Auto-restart if crashed unexpectedly (not during app shutdown)
      if (code !== 0 && !app.isQuitting) {
        console.log('[TTS] Auto-restarting server in 3 seconds...');
        setTimeout(() => {
          if (!ttsProcess) spawnTtsServer();
        }, 3000);
      }
    });

    ttsProcess.on('error', (err) => {
      console.error('[TTS] Spawn error:', err);
      ttsProcess = null;
    });

    console.log('[TTS] Server spawned, PID:', ttsProcess.pid);
    return true;
  } catch (err) {
    if (err.code === 'UNKNOWN' || err.errno === -4094 || err.code === 'EACCES' || err.code === 'EPERM') {
      console.warn('[TTS] Local python.exe blocked by Windows App Control security policy.');
    } else {
      console.error('[TTS] Failed to spawn server:', err.message);
    }
    ttsProcess = null;
    return false;
  }
}

/**
 * Forcefully terminate the TTS server process and its entire process tree.
 * Safe to call multiple times.
 */
function terminateTtsProcess() {
  if (!ttsProcess) return;

  const pid = ttsProcess.pid;
  ttsProcess = null; // clear reference immediately to avoid double-kill

  if (!pid) return;

  console.log('[TTS] Terminating PID', pid);

  if (process.platform === 'win32') {
    // /T kills the entire process tree; /F forces termination
    try {
      execSync(`taskkill /pid ${pid} /T /F`, { stdio: 'ignore' });
    } catch {
      try { process.kill(pid); } catch { /* already gone */ }
    }
  } else {
    // Negative PID kills the entire process group on Unix
    try {
      process.kill(-pid, 'SIGKILL');
    } catch {
      try { process.kill(pid, 'SIGKILL'); } catch { /* already gone */ }
    }
  }
}

// ─── AI backend server state (server.py on port 8000) ────────────────────────

const AI_PORT = 8000;
const AI_HEALTH_URL = `http://127.0.0.1:${AI_PORT}/health`;
let aiProcess = null;

/** Quick HTTP health-check for AI backend; resolves false on any error. */
async function isAiServerRunning() {
  try {
    const res = await fetch(AI_HEALTH_URL, {
      signal: AbortSignal.timeout(1500),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Poll until AI backend is healthy or timeout expires. */
async function waitForAiServerReady(timeoutMs = 45_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await isAiServerRunning()) return true;
    await new Promise((r) => setTimeout(r, 800));
  }
  return false;
}

/**
 * Resolve python executable and AI server script paths.
 * Packaged:  process.resourcesPath / tts-env / Scripts / python.exe
 * Dev:       __dirname            / tts-env / Scripts / python.exe
 */
function getAiServerPaths() {
  const base = app.isPackaged ? process.resourcesPath : __dirname;
  return {
    pythonExe: path.join(base, 'tts-env', 'Scripts', 'python.exe'),
    serverScript: path.join(base, 'server.py'),
  };
}

/**
 * Spawn the AI backend server with output capture for diagnostics.
 */
function spawnAiServer() {
  const { pythonExe, serverScript } = getAiServerPaths();

  if (!fs.existsSync(pythonExe)) {
    console.warn('[AI Server] python.exe not found at:', pythonExe);
    return false;
  }
  if (!fs.existsSync(serverScript)) {
    console.warn('[AI Server] server script not found at:', serverScript);
    return false;
  }

  try {
    aiProcess = spawn(pythonExe, [serverScript], {
      cwd: path.dirname(serverScript),
      env: {
        ...process.env,
        PYTHONIOENCODING: 'utf-8',
        PYTHONUTF8: '1',
        PYTHONUNBUFFERED: '1',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
      detached: false,
    });

    if (aiProcess.stdout) {
      aiProcess.stdout.on('data', (data) => {
        const msg = data.toString().trim();
        if (msg) console.log(`[AI Server stdout] ${msg}`);
      });
    }
    if (aiProcess.stderr) {
      aiProcess.stderr.on('data', (data) => {
        const msg = data.toString().trim();
        if (msg) console.warn(`[AI Server stderr] ${msg}`);
      });
    }

    aiProcess.on('exit', (code, signal) => {
      console.log(`[AI Server] Server exited: code=${code}, signal=${signal}`);
      aiProcess = null;

      if (code !== 0 && !app.isQuitting) {
        console.log('[AI Server] Auto-restarting server in 3 seconds...');
        setTimeout(() => {
          if (!aiProcess) spawnAiServer();
        }, 3000);
      }
    });

    aiProcess.on('error', (err) => {
      console.error('[AI Server] Spawn error:', err);
      aiProcess = null;
    });

    console.log('[AI Server] Server spawned, PID:', aiProcess.pid);
    return true;
  } catch (err) {
    if (err.code === 'UNKNOWN' || err.errno === -4094 || err.code === 'EACCES' || err.code === 'EPERM') {
      console.warn('[AI Server] Local python.exe blocked by Windows App Control security policy.');
    } else {
      console.error('[AI Server] Failed to spawn server:', err.message);
    }
    aiProcess = null;
    return false;
  }
}

/**
 * Forcefully terminate the AI server process and its entire process tree.
 */
function terminateAiServerProcess() {
  if (!aiProcess) return;

  const pid = aiProcess.pid;
  aiProcess = null;

  if (!pid) return;

  console.log('[AI Server] Terminating PID', pid);

  if (process.platform === 'win32') {
    try {
      execSync(`taskkill /pid ${pid} /T /F`, { stdio: 'ignore' });
    } catch {
      try { process.kill(pid); } catch { /* already gone */ }
    }
  } else {
    try {
      process.kill(-pid, 'SIGKILL');
    } catch {
      try { process.kill(pid, 'SIGKILL'); } catch { /* already gone */ }
    }
  }
}

// ─── IPC handlers ────────────────────────────────────────────────────────────

ipcMain.handle('tts-server:status', async () => {
  return (await isTtsRunning()) ? 'running' : 'stopped';
});

ipcMain.handle('tts-server:start', async () => {
  if (await isTtsRunning()) return 'running';
  if (!ttsProcess && !spawnTtsServer()) return 'env-missing';
  const ready = await waitForTtsReady();
  return ready ? 'running' : 'starting';
});

ipcMain.handle('ai-server:status', async () => {
  return (await isAiServerRunning()) ? 'running' : 'stopped';
});

ipcMain.handle('ai-server:start', async () => {
  if (await isAiServerRunning()) return 'running';
  if (!aiProcess && !spawnAiServer()) return 'env-missing';
  const ready = await waitForAiServerReady();
  return ready ? 'running' : 'starting';
});


// Helper to clean up old temporary speech WAV files
function cleanTempWavFiles() {
  try {
    const tempDir = path.join(__dirname, 'temp');
    if (fs.existsSync(tempDir)) {
      const files = fs.readdirSync(tempDir);
      for (const file of files) {
        if (file.endsWith('.wav')) {
          try { fs.unlinkSync(path.join(tempDir, file)); } catch {}
        }
      }
    }
  } catch (err) {
    console.warn('[Main] Temp cleanup error:', err.message);
  }
}

// ─── Electron-native TTS via local Python server ─────────────────────────────
//
// Accepts { text, voiceModel } where voiceModel is 'Ryan', 'Joe', 'Alba', 'Kareem', etc.
// Maps voiceModel → Piper voice ID → POSTs to local Python TTS server.
// Writes a unique timestamped WAV to temp/ to prevent Chromium audio caching.
// Falls back to piper.exe binary if the HTTP server is unavailable.
//

/** Map friendly voice model names to Piper voice IDs */
const VOICE_MODEL_MAP = {
  Ryan:   'en_US-ryan-medium',
  Joe:    'en_US-joe-medium',
  Alba:   'en_GB-alba-medium',
  Lessac: 'en_US-lessac-medium',
  Amy:    'en_US-amy-medium',
  Kareem: 'ar_JO-kareem-medium',
};

ipcMain.handle('generate-piper-tts', async (_event, { text, voiceModel } = {}) => {
  // Resolve voiceModel → Piper voice ID (fallback to ryan if unrecognised)
  const resolvedVoice = VOICE_MODEL_MAP[voiceModel] || voiceModel || 'en_US-ryan-medium';

  // Ensure temp directory exists
  const tempDir = path.join(__dirname, 'temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  // Unique filename per request — prevents Chromium caching the same file path
  const uniqueId = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const outPath  = path.join(tempDir, `speech_${uniqueId}.wav`);

  console.log(`[TTS IPC] model="${voiceModel}" → voice="${resolvedVoice}" | text="${(text || '').slice(0, 60)}…"`);

  // ── POST to local Python TTS HTTP server (sole synthesis path) ────────────
  // 10s timeout: if server isn't responding by now, fallback immediately.
  try {
    const res = await fetch('http://127.0.0.1:8100/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice: resolvedVoice }),
      signal: AbortSignal.timeout(60000), // 60s timeout for TTS synthesis
    });
    if (res.ok) {
      const arrayBuffer = await res.arrayBuffer();
      fs.writeFileSync(outPath, Buffer.from(arrayBuffer));
      console.log(`[TTS IPC] ✓ HTTP synthesized → ${outPath}`);
      return outPath;
    }
    const errBody = await res.text().catch(() => '');
    console.warn(`[TTS IPC] HTTP server returned ${res.status}: ${errBody.slice(0, 200)}`);
    return null;
  } catch (httpErr) {
    console.warn('[TTS IPC] HTTP server unavailable:', httpErr.message);
    return null;
  }
});

// ─── Cleanup hooks ───────────────────────────────────────────────────────────

function cleanupAllProcesses() {
  cleanTempWavFiles();
  terminateTtsProcess();
  terminateAiServerProcess();
}

app.on('before-quit', cleanupAllProcesses);
app.on('will-quit', cleanupAllProcesses);
process.on('exit', cleanupAllProcesses);

// Catch unexpected crashes so background servers are never left as zombies
process.on('uncaughtException', (err) => {
  console.error('[Main] Uncaught exception:', err);
  cleanupAllProcesses();
});

process.on('SIGINT', () => {
  app.isQuitting = true;
  cleanupAllProcesses();
  process.exit(0);
});

process.on('SIGTERM', () => {
  app.isQuitting = true;
  cleanupAllProcesses();
  process.exit(0);
});

// Enable GPU hardware acceleration and smooth rendering flags
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');
app.commandLine.appendSwitch('ignore-gpu-blocklist');
app.commandLine.appendSwitch('enable-features', 'VaapiVideoDecoder,CanvasOopRasterization,SmoothScrolling');

// Disable user gesture requirement for audio/video autoplay in Chromium/Electron
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

// ─── BrowserWindow ───────────────────────────────────────────────────────────

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 900,
    minHeight: 600,
    title: 'Study Hub — RPG Dashboard',
    autoHideMenuBar: true,
    // Prevent blank flash before content is ready
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      autoplayPolicy: 'no-user-gesture-required',
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  win.setMenu(null);

  // Show window only once content is painted (eliminates white flash)
  win.once('ready-to-show', () => win.show());

  // ── Forward ALL renderer console messages to the terminal ─────────────────
  // This lets us see JS errors without opening DevTools manually.
  win.webContents.on('console-message', (_event, level, message, line, sourceId) => {
    const tag = ['[DBG]', '[INF]', '[WRN]', '[ERR]'][level] || '[LOG]';
    console.log(`[Renderer]${tag} ${message}  (${sourceId}:${line})`);
  });

  // ── Catch any page-load failures ─────────────────────────────────────────
  win.webContents.on('did-fail-load', (_event, code, desc, url) => {
    console.error(`[Main] Page load failed: ${desc} (${code}) for ${url}`);
  });

  // ── GUARD 1: Block ALL new-window / popup requests ────────────────────────
  // Primary guard against Edge / Chrome being opened via window.open()
  win.webContents.setWindowOpenHandler(({ url }) => {
    console.log('[Nav] Blocked new-window request for:', url);
    return { action: 'deny' };
  });

  // ── GUARD 2: Block in-page navigation away from our local file ────────────
  // Covers: <a href="https://...">, window.location assignments, etc.
  win.webContents.on('will-navigate', (event, url) => {
    const isLocalFile = url.startsWith('file://');
    const isDevServer =
      !app.isPackaged && url.startsWith('http://localhost:5173');

    if (!isLocalFile && !isDevServer) {
      event.preventDefault();
      console.log('[Nav] Blocked navigation to:', url);
    }
  });

  // ── GUARD 3: Block server-side redirects ──────────────────────────────────
  win.webContents.on('will-redirect', (event, url) => {
    const isLocalFile = url.startsWith('file://');
    const isDevServer =
      !app.isPackaged && url.startsWith('http://localhost:5173');

    if (!isLocalFile && !isDevServer) {
      event.preventDefault();
      console.log('[Nav] Blocked redirect to:', url);
    }
  });

  // ── Load the app ──────────────────────────────────────────────────────────
  // Dev  (NODE_ENV=development): connect to Vite dev server on localhost:5173
  // Prod (packaged or npm run desktop): load compiled dist/index.html
  const isDev =
    !app.isPackaged && process.env.NODE_ENV === 'development';

  if (isDev) {
    win.loadURL('http://localhost:5173').catch((err) => {
      console.error('[Main] Failed to connect to dev server:', err.message);
    });
  } else {
    const indexPath = path.join(__dirname, 'dist', 'index.html');
    console.log('[Main] Loading local file:', indexPath);

    // ── Clear stale service workers & caches BEFORE loading ─────────────────
    // The VitePWA plugin registers a service worker. After a rebuild, the old
    // SW can intercept requests and serve stale/missing assets — producing a
    // blank white screen. Clearing it here guarantees a clean load every time.
    win.webContents.session
      .clearStorageData({ storages: ['serviceworkers', 'cachestorage'] })
      .then(() => {
        console.log('[Main] Cleared stale service workers & caches.');
        return win.loadFile(indexPath);
      })
      .catch((err) => {
        console.error('[Main] Failed to load index.html:', err.message);
        win.loadURL(
          `data:text/html,<h2 style="font-family:sans-serif;color:#f87171;padding:2rem">` +
            `Failed to load application.<br><small>${err.message}</small></h2>`
        );
      });
  }

  return win;
}

// ─── App lifecycle ────────────────────────────────────────────────────────────

app.whenReady().then(async () => {
  cleanTempWavFiles();

  // ── Start both Python servers in parallel (TTS on 8100, AI on 8000) ────────
  await Promise.all([
    // 1. Piper TTS server (port 8100)
    (async () => {
      const alreadyRunning = await isTtsRunning();
      if (alreadyRunning) {
        console.log('[TTS] Server already running externally (port 8100 responding)');
        return true;
      }
      console.log('[TTS] Starting local Python TTS server...');
      const spawned = spawnTtsServer();
      if (spawned) {
        console.log('[TTS] Waiting for server to become ready (max 45s)...');
        const ready = await waitForTtsReady(45000);
        if (ready) {
          console.log('[TTS] ✓ Server is ready and responding on port 8100');
        } else {
          console.warn('[TTS] ⚠ Server did not respond within 45s — will use fallback TTS');
        }
        return ready;
      } else {
        console.warn('[TTS] ℹ Local server offline — app will use Amazon Polly cloud & browser TTS fallbacks');
        return false;
      }
    })(),

    // 2. AI Backend server (port 8000)
    (async () => {
      const alreadyRunning = await isAiServerRunning();
      if (alreadyRunning) {
        console.log('[AI Server] Server already running externally (port 8000 responding)');
        return true;
      }
      console.log('[AI Server] Starting local Python AI server (port 8000)...');
      const spawned = spawnAiServer();
      if (spawned) {
        console.log('[AI Server] Waiting for server to become ready (max 45s)...');
        const ready = await waitForAiServerReady(45000);
        if (ready) {
          console.log('[AI Server] ✓ Server is ready and responding on port 8000');
        } else {
          console.warn('[AI Server] ⚠ Server did not respond within 45s');
        }
        return ready;
      } else {
        console.warn('[AI Server] ℹ Local server offline — app will use Groq & OpenRouter cloud AI fallbacks');
        return false;
      }
    })(),
  ]);

  createWindow();

  // macOS: re-create window when dock icon is clicked with no open windows
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  app.isQuitting = true;
  cleanupAllProcesses();
  if (process.platform !== 'darwin') app.quit();
});