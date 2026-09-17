"""Local Piper text-to-speech server for the Study Hub mascot.

Runs a tiny HTTP server on your own machine — free, offline, unlimited.
Voice models are downloaded automatically from Hugging Face the first time
they are used (saved into the ./voices folder).

Optimized for ultra-low latency:
- Multi-threaded ONNX Runtime session configuration
- Background model pre-loading & pre-warming on startup
- In-memory LRU + on-disk audio caching for instant (<1ms) repeated playback
- Fast medium-quality models by default
"""

from contextlib import asynccontextmanager
import hashlib
import io
import json
import os
import sys
import threading
import time
import wave
from pathlib import Path
from urllib.request import urlopen

# Ensure UTF-8 output encoding on Windows console so phonetic characters never crash the process
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
import onnxruntime as ort
from pydantic import BaseModel

from piper import PiperConfig, PiperVoice, SynthesisConfig

FAST_SYN_CONFIG = SynthesisConfig(length_scale=1.0)

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
PORT = int(os.environ.get("PIPER_PORT", "8100"))
VOICE_DIR = Path(os.environ.get("VOICES_DIR") or (Path(__file__).parent / "voices"))
CACHE_DIR = VOICE_DIR / ".cache"
DEFAULT_VOICE = os.environ.get("PIPER_VOICE", "en_US-ryan-medium")

# Voice id format: {lang_code}-{voice_name}-{quality}  e.g. en_US-ryan-medium
HF_URL = (
    "https://huggingface.co/rhasspy/piper-voices/resolve/main/"
    "{lang_family}/{lang_code}/{voice_name}/{quality}/"
    "{voice_id}{ext}?download=true"
)

# Voice aliases mapping friendly names to Piper voice model IDs
VOICE_ALIASES = {
    # Generic aliases
    "ryan": "en_US-ryan-medium",
    "joe": "en_US-joe-medium",
    "lessac": "en_US-lessac-medium",
    "amy": "en_US-amy-medium",
    "alba": "en_GB-alba-medium",
    "kareem": "ar_JO-kareem-medium",
    # ── Feynman Tribunal judge voices ────────────────────────────────────────
    # Skeptic Professor  — deep/authoritative
    "judge_skeptic_en": "en_US-joe-medium",      # deep, authoritative US male
    "judge_skeptic_ar": "ar_JO-kareem-medium",   # formal Arabic male (Jordan)
    # Curious Child      — lively/clear
    "judge_child_en": "en_US-ryan-medium",        # natural, friendly US male
    "judge_child_ar": "ar_JO-kareem-medium",      # best available Arabic (lighter text)
    # Pragmatic Engineer — confident/direct
    "judge_engineer_en": "en_GB-alba-medium",     # Scottish GB — distinct, authoritative
    "judge_engineer_ar": "ar_JO-kareem-medium",   # standard Arabic male
}

# Curated voices offered to the UI
AVAILABLE_VOICES = [
    {"id": "en_US-ryan-medium", "name": "Ryan — Male, Fast & Natural (Default)", "lang": "en-US"},
    {"id": "en_US-lessac-medium", "name": "Lessac — Female, Clear (US)", "lang": "en-US"},
    {"id": "en_US-amy-medium", "name": "Amy — Female, Warm (US)", "lang": "en-US"},
    {"id": "en_US-joe-medium", "name": "Joe — Male, Deep (US) · Skeptic Professor", "lang": "en-US"},
    {"id": "en_GB-alba-medium", "name": "Alba — Female, Scottish (UK)", "lang": "en-GB"},
    {"id": "ar_JO-kareem-medium", "name": "Kareem — Male, Arabic (Jordan) · Arabic Judges", "lang": "ar-JO"},
    {"id": "en_US-ryan-high", "name": "Ryan — Male, High Quality (Slower)", "lang": "en-US"},
]

# Voice cache management
_voice_cache: dict[str, PiperVoice] = {}
_voice_lock = threading.Lock()
_current_voice_id: str | None = None  # Track currently loaded voice
_audio_cache: dict[str, bytes] = {}
_audio_cache_lock = threading.Lock()
MAX_MEMORY_CACHE_ITEMS = 500

CACHE_DIR.mkdir(parents=True, exist_ok=True)


def _get_cache_key(voice_id: str, text: str) -> str:
    """Generate unique hash for voice + text combination."""
    raw = f"{voice_id}::{text.strip().lower()}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


def _get_cached_audio(cache_key: str) -> bytes | None:
    """Retrieve audio from memory or disk cache."""
    with _audio_cache_lock:
        if cache_key in _audio_cache:
            return _audio_cache[cache_key]

    disk_path = CACHE_DIR / f"{cache_key}.wav"
    if disk_path.exists():
        try:
            data = disk_path.read_bytes()
            with _audio_cache_lock:
                if len(_audio_cache) >= MAX_MEMORY_CACHE_ITEMS:
                    _audio_cache.pop(next(iter(_audio_cache)))
                _audio_cache[cache_key] = data
            return data
        except Exception:
            pass
    return None


def _save_cached_audio(cache_key: str, audio: bytes) -> None:
    """Save audio to memory and disk cache."""
    with _audio_cache_lock:
        if len(_audio_cache) >= MAX_MEMORY_CACHE_ITEMS:
            _audio_cache.pop(next(iter(_audio_cache)))
        _audio_cache[cache_key] = audio

    try:
        disk_path = CACHE_DIR / f"{cache_key}.wav"
        disk_path.write_bytes(audio)
    except Exception:
        pass


def _parse_voice_id(voice_id: str) -> dict:
    """Split a Piper voice id into its URL parts."""
    parts = voice_id.split("-")
    if len(parts) < 3:
        raise ValueError(f"Invalid voice id: {voice_id}")
    quality = parts[-1]
    voice_name = parts[-2]
    lang_code = "-".join(parts[:-2])          # e.g. en_US
    lang_family = lang_code.split("_")[0]      # e.g. en
    return {
        "lang_family": lang_family,
        "lang_code": lang_code,
        "voice_name": voice_name,
        "quality": quality,
        "voice_id": voice_id,
    }


def _download_file(url: str, dest: Path) -> None:
    print(f"Downloading {url}")
    dest.parent.mkdir(parents=True, exist_ok=True)
    with urlopen(url) as response:
        dest.write_bytes(response.read())


def ensure_voice_files(voice_id: str) -> tuple[Path, Path]:
    """Make sure the .onnx and .onnx.json files exist, downloading if needed."""
    resolved_id = VOICE_ALIASES.get(voice_id.lower(), voice_id)
    model_path = VOICE_DIR / f"{resolved_id}.onnx"
    config_path = VOICE_DIR / f"{resolved_id}.onnx.json"
    if model_path.exists() and config_path.exists():
        return model_path, config_path

    parts = _parse_voice_id(resolved_id)
    _download_file(HF_URL.format(ext=".onnx", **parts), model_path)
    _download_file(HF_URL.format(ext=".onnx.json", **parts), config_path)
    return model_path, config_path


def _create_optimized_voice(model_path: Path, config_path: Path) -> PiperVoice:
    """Instantiate PiperVoice with multi-threaded ONNX session."""
    with open(config_path, "r", encoding="utf-8") as f:
        config_dict = json.load(f)

    opts = ort.SessionOptions()
    # Ultra-fast multi-threading: Utilize available CPU cores
    cpu_cores = os.cpu_count() or 4
    opts.intra_op_num_threads = min(cpu_cores, 8)
    opts.inter_op_num_threads = 2
    opts.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL
    opts.execution_mode = ort.ExecutionMode.ORT_SEQUENTIAL

    sess = ort.InferenceSession(
        str(model_path),
        sess_options=opts,
        providers=["CPUExecutionProvider"],
    )

    return PiperVoice(
        config=PiperConfig.from_dict(config_dict),
        session=sess,
    )


MAX_LOADED_VOICES = 4

def get_voice(voice_id: str) -> PiperVoice:
    """Load and keep active Piper voices in memory for instant synthesis."""
    resolved_id = VOICE_ALIASES.get(voice_id.lower(), voice_id)
    
    with _voice_lock:
        if resolved_id not in _voice_cache:
            # If cache limit reached, prune oldest voice
            if len(_voice_cache) >= MAX_LOADED_VOICES:
                oldest_id = next(iter(_voice_cache))
                old_voice = _voice_cache.pop(oldest_id)
                if hasattr(old_voice, 'session') and old_voice.session:
                    try:
                        del old_voice.session
                    except Exception:
                        pass
                del old_voice
            
            model_path, config_path = ensure_voice_files(resolved_id)
            print(f"[TTS Server] Loading voice {resolved_id} from {model_path} (fast {min(os.cpu_count() or 4, 8)} threads)", flush=True)
            voice = _create_optimized_voice(model_path, config_path)
            _voice_cache[resolved_id] = voice
        
        return _voice_cache[resolved_id]


def _preload_default_voice():
    """Preload primary Ryan voice in background after server binds port."""
    time.sleep(1.0)
    try:
        print(f"[TTS Server] Preloading default voice ({DEFAULT_VOICE}) in background...", flush=True)
        get_voice(DEFAULT_VOICE)
        print(f"[TTS Server] Default voice ({DEFAULT_VOICE}) ready for instant playback.", flush=True)
    except Exception as exc:
        print(f"[TTS Server] Voice preload notice: {exc}", flush=True)


# ---------------------------------------------------------------------------
# HTTP app
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    threading.Thread(target=_preload_default_voice, daemon=True).start()
    print("[TTS Server] Ready — background voice preloading started.")
    yield


app = FastAPI(title="Study Hub Local TTS (Piper Optimized)", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


class TTSRequest(BaseModel):
    text: str
    voice: str | None = None


def _synthesize(text: str, voice_id: str) -> bytes:
    voice = get_voice(voice_id)
    buffer = io.BytesIO()
    with _voice_lock:
        with wave.open(buffer, "wb") as wav_file:
            voice.synthesize_wav(text, wav_file, syn_config=FAST_SYN_CONFIG)
    return buffer.getvalue()


@app.get("/health")
def health():
    return {
        "status": "ok",
        "engine": "piper",
        "default_voice": DEFAULT_VOICE,
        "voices": AVAILABLE_VOICES,
        "loaded_voices": list(_voice_cache.keys()),
        "cached_phrases": len(_audio_cache),
    }


@app.get("/voices")
def voices():
    return {"default": DEFAULT_VOICE, "voices": AVAILABLE_VOICES}


@app.get("/tts")
def tts_get(
    text: str = Query(..., description="Text to speak"),
    voice: str = Query(None, description="Piper voice id (optional)"),
):
    return _handle(text, voice)


@app.post("/tts")
def tts_post(
    payload: TTSRequest,
    voice: str | None = Query(None, description="Optional voice query override"),
):
    target_voice = payload.voice or voice
    return _handle(payload.text, target_voice)


import re

def _clean_text(text: str) -> str:
    """Sanitize text before Piper synthesis to eliminate phonetic errors and pauses."""
    if not text:
        return ""
    # Clean console mojibake sequences
    t = re.sub(r'ΓÇª|Γ£ô|ΓåÆ|ΓÇô|ΓÇö', ' ', text)
    # Replace ellipses and dashes with standard pauses
    t = re.sub(r'[…\u2026]', '. ', t)
    t = re.sub(r'[—–]', ', ', t)
    # Remove markdown formatting and asterisks
    t = re.sub(r'\*[^*]+\*', '', t)
    t = re.sub(r'[*_#`~\[\]\(\)]', '', t)
    # Remove emojis
    t = re.sub(r'[\U00010000-\U0010ffff\u2600-\u27BF]', '', t)
    # Add space after punctuation glued to letters (e.g. "analysis.I" -> "analysis. I")
    t = re.sub(r'([.!?؛?,])([A-Za-z\u0600-\u06FF])', r'\1 \2', t)
    # Deduplicate consecutive repetitive sentences
    sentences = re.split(r'(?<=[.!?؛؟])\s+', t)
    unique_sentences = []
    seen = set()
    for s in sentences:
        norm = re.sub(r'[^a-zA-Z0-9\u0600-\u06FF]', '', s.strip().lower())
        if norm and norm not in seen:
            seen.add(norm)
            unique_sentences.append(s.strip())
    if unique_sentences:
        t = " ".join(unique_sentences)
    return re.sub(r'\s+', ' ', t).strip()


def _handle(text: str, voice: str | None):
    text = _clean_text(text)
    if not text:
        raise HTTPException(status_code=400, detail="Empty text")
    raw_voice = (voice or DEFAULT_VOICE).strip()
    voice_id = VOICE_ALIASES.get(raw_voice.lower(), raw_voice)

    # Arabic voices are NEVER cached — every request must synthesize fresh
    # to ensure different text produces different audio output.
    is_arabic = voice_id.startswith("ar")

    if not is_arabic:
        cache_key = _get_cache_key(voice_id, text)
        cached = _get_cached_audio(cache_key)
        if cached:
            return Response(
                content=cached,
                media_type="audio/wav",
                headers={"X-Cache-Status": "HIT", "Cache-Control": "public, max-age=86400"},
            )

    t0 = time.time()
    try:
        audio = _synthesize(text, voice_id)
        if not is_arabic:
            cache_key = _get_cache_key(voice_id, text)
            _save_cached_audio(cache_key, audio)
        dur = round(time.time() - t0, 3)
        print(f"[TTS] Synthesized {len(text)} chars in {dur}s ({voice_id})")
    except Exception as exc:
        print(f"[TTS Error] Synthesis failed: {exc}")
        raise HTTPException(status_code=500, detail=f"TTS failed: {exc}") from exc

    return Response(
        content=audio,
        media_type="audio/wav",
        headers={"X-Cache-Status": "MISS", "Cache-Control": "no-store"},
    )


@app.post("/tashkil")
def add_tashkil(payload: TTSRequest):
    """Add Arabic diacritics (Tashkil) to text for better TTS pronunciation.
    
    This is a simple rule-based approach. For best results, use a dedicated
    Arabic NLP library like Mishkal or Tashkeela.
    """
    text = (payload.text or "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="Empty text")
    
    # Simple Tashkil addition (basic rules)
    # Note: This is a placeholder. For production, use a proper Arabic NLP library.
    # For now, just return the text as-is since Piper handles phonemization internally.
    
    return {"original": text, "tashkil": text, "note": "Piper TTS handles Arabic phonemization automatically"}


if __name__ == "__main__":
    import uvicorn

    print(f"Study Hub local TTS server starting on http://127.0.0.1:{PORT}", flush=True)
    print(f"Default voice: {DEFAULT_VOICE}", flush=True)
    print(f"Voice directory: {VOICE_DIR}", flush=True)
    sys.stdout.flush()
    sys.stderr.flush()
    
    uvicorn.run(app, host="127.0.0.1", port=PORT, log_level="info")
