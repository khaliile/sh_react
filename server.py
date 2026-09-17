"""
server.py
FastAPI backend for AI Voice Coach offloading STT (Whisper Large v3 Turbo)
and LLM conversational response generation (Llama 3.1 8B Instant) via Groq API.
"""

import os
import sys
import tempfile
import json

# Ensure Windows stdout/stderr handles Arabic and UTF-8 characters safely without throwing UnicodeEncodeError
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

from typing import Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel
from groq import Groq
import boto3
from botocore.exceptions import BotoCoreError, ClientError

# Initialize FastAPI application
app = FastAPI(
    title="AI Voice Coach Backend",
    description="Groq-powered STT & Conversational AI pipeline for Study Hub RPG",
    version="1.0.0"
)

# ---------------------------------------------------------------------------
# CORS Middleware: Enable full local development access
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for local Vite / Electron / Browser dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Health Check Endpoint
# ---------------------------------------------------------------------------
@app.get("/health")
def health_check():
    """Liveness probe used by Electron and frontend to detect server readiness."""
    return {
        "status": "online",
        "service": "AI Voice Coach Backend",
        "stt_model": "whisper-large-v3-turbo",
        "llm_model": "llama-3.1-8b-instant"
    }

# ---------------------------------------------------------------------------
# Groq Client Setup
# ---------------------------------------------------------------------------
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")

def get_groq_client() -> Groq:
    """Instantiate and validate the official Groq client."""
    api_key = GROQ_API_KEY or os.environ.get("VITE_GROQ_API_KEY", "")
    if not api_key:
        # Fallback check from local .env if available
        env_path = os.path.join(os.path.dirname(__file__), ".env")
        if os.path.exists(env_path):
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    if line.startswith("GROQ_API_KEY=") or line.startswith("VITE_GROQ_API_KEY="):
                        api_key = line.strip().split("=", 1)[1].strip('"\'')
                        break
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="GROQ_API_KEY is not set. Please set the GROQ_API_KEY environment variable."
        )
    return Groq(api_key=api_key)


# ---------------------------------------------------------------------------
# Vercel AI Gateway — google/gemini-2.5-flash (Fast, Reliable Multimodal LLM)
# ---------------------------------------------------------------------------
import httpx

VERCEL_AI_KEY = os.environ.get("VERCEL_AI_KEY") or os.environ.get("VITE_VERCEL_AI_KEY", "")
VERCEL_BACKUP_KEY = os.environ.get("VERCEL_BACKUP_KEY", "")
VERCEL_GATEWAY_URL = "https://ai-gateway.vercel.sh/v1/chat/completions"
VERCEL_MODEL = "google/gemini-2.5-flash"

def _call_gateway(key: str, target_model: str, messages: list, max_tokens: int, temperature: float) -> str:
    with httpx.Client(timeout=60.0, verify=False) as client:
        resp = client.post(
            VERCEL_GATEWAY_URL,
            headers={
                "Authorization": f"Bearer {key}",
                "Content-Type": "application/json",
            },
            json={
                "model": target_model,
                "messages": messages,
                "max_tokens": max_tokens,
                "temperature": temperature,
            },
        )
    resp.raise_for_status()
    data = resp.json()
    content = data.get("choices", [{}])[0].get("message", {}).get("content", "").strip()
    if not content:
        raise HTTPException(status_code=502, detail="Vercel Gateway returned empty content.")
    return content

def _vercel_chat(messages: list, model: str = VERCEL_MODEL, max_tokens: int = 4096, temperature: float = 0.3) -> str:
    """
    Call Vercel AI Gateway with google/gemini-2.5-flash or specified model.
    Automatically falls back to backup key if the primary key requires a credit card.
    """
    primary_key = VERCEL_AI_KEY
    if not primary_key:
        # Fallback check from local .env if available
        env_path = os.path.join(os.path.dirname(__file__), ".env")
        if os.path.exists(env_path):
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    if line.startswith("VERCEL_AI_KEY=") or line.startswith("VITE_VERCEL_AI_KEY="):
                        primary_key = line.strip().split("=", 1)[1].strip('"\'')
                        break

    target_model = model or VERCEL_MODEL
    if "minimax" in target_model or "free" in target_model:
        target_model = VERCEL_MODEL

    try:
        return _call_gateway(primary_key or VERCEL_BACKUP_KEY, target_model, messages, max_tokens, temperature)
    except httpx.HTTPStatusError as e:
        # If card is required on new key (403) or quota issue, retry with verified backup key
        if (e.response.status_code == 403 or "credit card" in e.response.text.lower()) and primary_key != VERCEL_BACKUP_KEY:
            try:
                return _call_gateway(VERCEL_BACKUP_KEY, target_model, messages, max_tokens, temperature)
            except Exception as b_err:
                raise HTTPException(status_code=502, detail=f"Vercel Gateway call failed: {str(b_err)}")
        raise HTTPException(status_code=e.response.status_code, detail=f"Vercel Gateway HTTP error: {e.response.text}")
    except Exception as e:
        if primary_key != VERCEL_BACKUP_KEY:
            try:
                return _call_gateway(VERCEL_BACKUP_KEY, target_model, messages, max_tokens, temperature)
            except Exception:
                pass
        raise HTTPException(status_code=502, detail=f"Vercel Gateway call failed: {str(e)}")


def _call_nvidia_chat(messages: list, max_tokens: int = 1024, temperature: float = 0.7) -> str:
    key = os.environ.get("NVIDIA_API_KEY") or os.environ.get("VITE_NVIDIA_API_KEY", "")
    if not key:
        env_path = os.path.join(os.path.dirname(__file__), ".env")
        if os.path.exists(env_path):
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    if line.startswith("NVIDIA_API_KEY=") or line.startswith("VITE_NVIDIA_API_KEY="):
                        key = line.strip().split("=", 1)[1].strip('"\'')
                        break
    if not key:
        raise HTTPException(status_code=500, detail="NVIDIA_API_KEY is not configured.")

    with httpx.Client(timeout=30.0, verify=False) as client:
        resp = client.post(
            "https://integrate.api.nvidia.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
            json={
                "model": "meta/llama-3.2-11b-vision-instruct",
                "messages": messages,
                "max_tokens": max_tokens,
                "temperature": temperature
            }
        )
    resp.raise_for_status()
    data = resp.json()
    return data.get("choices", [{}])[0].get("message", {}).get("content", "").strip()

class GatewayChatRequest(BaseModel):
    messages: list
    model: str = VERCEL_MODEL
    max_tokens: int = 4096
    temperature: float = 0.3

@app.post("/api/ai-gateway")
def proxy_ai_gateway(req: GatewayChatRequest):
    """
    FastAPI proxy for AI requests with auto-failover to NVIDIA NIM and Vercel.
    """
    # Try NVIDIA NIM first for ultra-fast response
    try:
        content = _call_nvidia_chat(req.messages, max_tokens=min(req.max_tokens, 1024), temperature=req.temperature)
        if content:
            return {"choices": [{"message": {"role": "assistant", "content": content}}]}
    except Exception as nv_err:
        pass

    # Fallback to Vercel
    try:
        content = _vercel_chat(req.messages, model=req.model, max_tokens=req.max_tokens, temperature=req.temperature)
        return {
            "choices": [
                {
                    "message": {
                        "role": "assistant",
                        "content": content
                    }
                }
            ]
        }
    except Exception as v_err:
        raise HTTPException(status_code=502, detail=f"All backend AI providers failed: {str(v_err)}")


# ---------------------------------------------------------------------------
# Real-Time Web & Knowledge Search Endpoint
# ---------------------------------------------------------------------------
import re
import urllib.parse
import html

META_SEARCH_PATTERNS = [
    r'\b(can you|could you|do you|are you able to)\s+(search|browse|look up|access)(\s+(the|on))?\s*(internet|web|online|live)\b',
    r'^(can you search\??|do you have internet\??)$',
]

CONVERSATIONAL_SEARCH_PATTERNS = [
    r'^(can you|could you|please)\s+(see|tell me|search|find|check|show|look up|read)(\s+(what|about|if))?\b',
    r'^(what is the|what are the|what was the|what were the)\b',
    r'^(what the|what is|what are|what was)\b',
    r'^(who is the|who are the|who was the|who is)\b',
    r'^(tell me about|look up|search for)\b',
    r'\b(happen(ed)? on|happen(ed)? in|happening in|happening on)\b',
    r'\bwhat happen(ed)?\b',
    r'[\?؟!.,;:"\']+',
]

ARABIC_SEARCH_PATTERNS = [
    r'^(هل يمكنك|ممكن|تقدر|أخبرني عن|ما هو|ما هي|ماذا حدث في|ماذا يحدث في|ابحث عن)\b',
    r'[\?؟!.,;:"\']+',
]

def _clean_search_query(q: str, is_arabic: bool = False) -> tuple[str, list[str], bool]:
    trimmed = q.strip()
    for pat in META_SEARCH_PATTERNS:
        if re.search(pat, trimmed, re.IGNORECASE):
            return trimmed, [], True

    cleaned = trimmed
    patterns = ARABIC_SEARCH_PATTERNS if is_arabic else CONVERSATIONAL_SEARCH_PATTERNS
    for pat in patterns:
        cleaned = re.sub(pat, ' ', cleaned, flags=re.IGNORECASE)

    cleaned = re.sub(r'\blast\b', 'latest', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()

    anchors = []
    q_low = trimmed.lower()
    if 'iphone' in q_low:
        anchors.append('iPhone' if not is_arabic else 'آيفون')
        anchors.append('List_of_iPhone_models')
    if '2026' in q_low:
        anchors.append('2026')
    if '2025' in q_low:
        anchors.append('2025')
    if 'world cup' in q_low or 'كأس العالم' in trimmed:
        anchors.append('2026_FIFA_World_Cup' if not is_arabic else 'كأس_العالم_2026')
    if 'olympics' in q_low or 'الأولمبياد' in trimmed:
        anchors.append('2026_Winter_Olympics' if not is_arabic else 'الألعاب_الأولمبية_الشتوية_2026')

    return cleaned or trimmed, anchors, False

class SearchRequest(BaseModel):
    q: str
    messages: Optional[list[dict]] = None

def _rewrite_query_with_llm(raw_query: str, history: Optional[list[dict]] = None) -> str:
    """
    RAG Standalone Query Generation:
    Rewrites conversational follow-up questions (e.g. 'what about one piece...')
    into full, standalone search queries (e.g. 'One Piece upcoming anime release date 2027')
    using recent chat history context.
    """
    if not history:
        return raw_query

    formatted_turns = []
    for msg in history[-4:]:
        role = msg.get("role", "user")
        content = (msg.get("content") or "").strip()
        if content:
            formatted_turns.append(f"{role}: {content[:150]}")

    if not formatted_turns:
        return raw_query

    history_text = "\n".join(formatted_turns)
    system_prompt = (
        "You are an expert search query contextualizer. "
        "Given the conversation history and a user follow-up query, rewrite the follow-up into a single, complete, standalone web search query.\n"
        "Guidelines:\n"
        "- Incorporate necessary context (subject, entities, category, year) from previous turns.\n"
        "- If the query is already standalone, keep it as is.\n"
        "- Output ONLY the rewritten standalone query text.\n"
        "- Never include quotes, explanations, markdown, or greetings."
    )

    user_prompt = f"Chat History:\n{history_text}\n\nUser Follow-up: {raw_query}\n\nStandalone Search Query:"

    try:
        client = get_groq_client()
        # Prioritize llama-3.1-8b-instant as requested, with fallback to groq/compound-mini and qwen/qwen3.8-27b
        candidate_models = ["llama-3.1-8b-instant", "groq/compound-mini", "qwen/qwen3.8-27b"]

        for model_name in candidate_models:
            try:
                resp = client.chat.completions.create(
                    model=model_name,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    max_tokens=50,
                    temperature=0.0,
                    timeout=2.0
                )
                rewritten = resp.choices[0].message.content.strip()
                rewritten = re.sub(r'<think>[\s\S]*?(?:<\/think>|$)', '', rewritten).strip()
                first_line = rewritten.split('\n')[0].strip('\"\'` ')
                if first_line and len(first_line) > 2:
                    print(f"[Search Rewrite] '{raw_query}' -> '{first_line}' (model: {model_name})")
                    return first_line
            except Exception as model_err:
                print(f"[Search Rewrite] Model {model_name} failed: {model_err}")
                continue
    except Exception as e:
        print(f"[Search Rewrite] LLM query rewriting error (fallback to raw query): {e}")

    return raw_query

async def _execute_search(raw_query: str, messages: Optional[list[dict]] = None):
    raw_query = (raw_query or "").strip()
    if not raw_query:
        return {"query": raw_query, "results": [], "summary": ""}

    # 1. RAG Standalone Query Generation using chat history
    query = _rewrite_query_with_llm(raw_query, messages)

    is_arabic = bool(re.search(r'[\u0600-\u06FF]', query))
    wiki_lang = "ar" if is_arabic else "en"
    headers = {"User-Agent": "StudyHub-App/2.0 (student-assistant; contact: support@studyhub.local)"}

    cleaned, anchors, is_meta = _clean_search_query(query, is_arabic)
    if is_meta:
        summary = (
            "البحث المباشر عبر الإنترنت نشط وجاهز للرد." if is_arabic else
            "Live Web Search: Active and operational. The AI coach can search the internet for live real-time information, current year (2026) data, news, and world events."
        )
        return {"query": query, "raw_query": raw_query, "results": [{"title": "Web Search", "snippet": summary}], "summary": summary}

    OFFLINE_KNOWLEDGE = {
        'iphone': (
            "IPhone: Apple's latest flagship lineup includes the iPhone 16 and iPhone 16 Pro series equipped with Apple Intelligence, alongside the upcoming iPhone 17 series.",
            "آيفون: أحدث هواتف آبل هي سلسلة آيفون 16 وآيفون 16 برو المزودة بالذكاء الاصطناعي، تليها سلسلة آيفون 17."
        ),
        '2026': (
            "2026: 2026 is the current calendar year. Major scheduled events include the 2026 FIFA World Cup across North America, the Milan-Cortina Winter Olympics, and historic space exploration missions.",
            "2026: عام 2026 هو العام الحالي، ومن أهم أحداثه كأس العالم 2026 في أمريكا الشمالية ودورة الألعاب الأولمبية الشتوية في إيطاليا."
        ),
        'world cup': (
            "FIFA World Cup 2026: Jointly hosted by the United States, Canada, and Mexico in June–July 2026 with 48 competing nations.",
            "كأس العالم 2026: تستضيفه الولايات المتحدة وكندا والمكسيك بمشاركة 48 منتخباً."
        ),
        'olympics': (
            "Winter Olympics 2026: Hosted in Milan and Cortina d'Ampezzo, Italy in February 2026.",
            "الأولمبياد الشتوي 2026: يقام في ميلانو وكورتينا في إيطاليا في فبراير 2026."
        )
    }

    results = []
    summary_parts = []

    async with httpx.AsyncClient(timeout=3.5, verify=False) as client:
        # 1. Check direct anchors via fast Wikimedia REST Page Summary CDN (<150ms)
        for anchor in anchors:
            try:
                url = f"https://{wiki_lang}.wikipedia.org/api/rest_v1/page/summary/{urllib.parse.quote(anchor)}"
                r = await client.get(url, headers=headers)
                if r.status_code == 200:
                    data = r.json()
                    extract = data.get("extract", "").strip()
                    title = data.get("title", "")
                    if extract and data.get("type") != "disambiguation":
                        if anchor == '2026':
                            try:
                                ext_url = f"https://{wiki_lang}.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=1&explaintext=1&titles=2026&format=json"
                                ext_r = await client.get(ext_url, headers=headers, timeout=2.0)
                                pages = ext_r.json().get('query', {}).get('pages', {})
                                for pid, p in pages.items():
                                    full_intro = p.get('extract', '')
                                    if full_intro:
                                        extract = full_intro
                            except Exception:
                                pass
                        sentences = [s.strip() for s in extract.split('. ') if s.strip()]
                        clean_summary = '. '.join(sentences[:3])
                        if not clean_summary.endswith('.'):
                            clean_summary += '.'
                        results.append({"title": title, "snippet": clean_summary})
                        summary_parts.append(f"{title}: {clean_summary}")
                        break
            except Exception as e:
                print(f"[Search API] Anchor {anchor} error: {e}")

        # 2. Wikipedia Search API with cleaned terms if anchor didn't match
        if not summary_parts:
            search_term = cleaned or query
            try:
                wiki_url = f"https://{wiki_lang}.wikipedia.org/w/api.php"
                wiki_params = {
                    "action": "query",
                    "list": "search",
                    "srsearch": search_term,
                    "utf8": 1,
                    "format": "json",
                    "srlimit": 4
                }
                resp = await client.get(wiki_url, params=wiki_params, headers=headers)
                if resp.status_code == 200:
                    items = resp.json().get("query", {}).get("search", [])
                    for item in items[:2]:
                        title = item.get("title", "")
                        if not title:
                            continue
                        try:
                            sum_url = f"https://{wiki_lang}.wikipedia.org/api/rest_v1/page/summary/{urllib.parse.quote(title.replace(' ', '_'))}"
                            sum_resp = await client.get(sum_url, headers=headers, timeout=2.0)
                            if sum_resp.status_code == 200:
                                s_data = sum_resp.json()
                                extract = s_data.get("extract", "").strip()
                                if extract and s_data.get("type") != "disambiguation":
                                    sentences = [s.strip() for s in extract.split('. ') if s.strip()]
                                    clean_extract = '. '.join(sentences[:2])
                                    if not clean_extract.endswith('.'):
                                        clean_extract += '.'
                                    results.append({"title": title, "snippet": clean_extract})
                                    summary_parts.append(f"{title}: {clean_extract}")
                                    continue
                        except Exception:
                            pass
                        
                        raw_snippet = item.get("snippet", "")
                        clean_snippet = re.sub(r'<[^>]+>', '', raw_snippet).replace('&quot;', '"').replace('&#039;', "'").strip()
                        if clean_snippet:
                            results.append({"title": title, "snippet": clean_snippet})
                            summary_parts.append(f"{title}: {clean_snippet}")
            except Exception as e:
                print(f"[Search API] Wikipedia search error: {e}")

    # 3. Knowledge fallback if external search produced no summary (network timeout or offline)
    if not summary_parts:
        q_lower = query.lower()
        for k, (en_val, ar_val) in OFFLINE_KNOWLEDGE.items():
            if k in q_lower or (is_arabic and k in cleaned):
                ans = ar_val if is_arabic else en_val
                summary_parts.append(ans)
                results.append({"title": k.title(), "snippet": ans})
                break

    summary = " | ".join(summary_parts[:2])
    return {
        "query": query,
        "raw_query": raw_query,
        "results": results[:3],
        "summary": summary
    }

@app.post("/api/search")
async def search_web_post(req: SearchRequest):
    """
    Ultra-fast real-time search with RAG query rewriting using conversation history.
    """
    return await _execute_search(req.q, req.messages)

@app.get("/api/search")
async def search_web_get(q: str = Query(..., description="Search query")):
    """
    Legacy GET endpoint for direct search query execution.
    """
    return await _execute_search(q, None)



# ---------------------------------------------------------------------------
# Helper: Transcribe Audio File using Groq Whisper
# ---------------------------------------------------------------------------
async def _transcribe_file(audio: UploadFile, language: Optional[str] = None) -> str:
    client = get_groq_client()

    filename = audio.filename or "recording.webm"
    ext = os.path.splitext(filename)[1]
    if not ext:
        if "wav" in (audio.content_type or ""):
            ext = ".wav"
        elif "mp3" in (audio.content_type or ""):
            ext = ".mp3"
        elif "ogg" in (audio.content_type or ""):
            ext = ".ogg"
        else:
            ext = ".webm"

    temp_audio_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as temp_file:
            content = await audio.read()
            if not content or len(content) < 1500:
                print(f"[STT Server] Rejected audio: too small ({len(content) if content else 0} bytes) — likely silence")
                return ""
            temp_file.write(content)
            temp_audio_path = temp_file.name


        with open(temp_audio_path, "rb") as audio_file:
            audio_bytes = audio_file.read()
            transcription_params = {
                "file": (os.path.basename(temp_audio_path), audio_bytes),
                "model": "whisper-large-v3-turbo",
                "response_format": "json",
                "temperature": 0.0,
                "prompt": "Study Hub assistant conversation with student in English and Arabic.",
            }
            # Specify language if provided
            if language and language in ["en", "ar", "fr", "es", "de", "ja"]:
                transcription_params["language"] = language

            stt_result = client.audio.transcriptions.create(**transcription_params)
            raw_text = getattr(stt_result, "text", "").strip()
            print(f"[STT Server] Received {len(content)} bytes audio | Whisper raw: \"{raw_text}\"")

            HALLUCINATIONS = {
                "thank you.", "thank you", "thanks for watching.", "thanks for watching",
                "thank you for watching.", "thank you for watching", "subtitles by",
                "subscribed", "subscribe", "you", "bye", "bye bye", "mbc",
                "شكرا", "شكرا لكم", "شكرا للمشاهدة", "اشترك في القناة", "تفريغ",
                ".", "..", "...", "!", "?", "null", "none"
            }
            cleaned = raw_text.strip().strip(".,!?-_~`").strip()
            if cleaned.lower() in HALLUCINATIONS or len(cleaned) == 0:
                print(f"[STT Server] Filtered out silence/hallucination: \"{raw_text}\"")
                return ""
            return raw_text
    except Exception as e:
        print(f"[STT Server Error] {e}")
        return ""
    finally:
        if temp_audio_path and os.path.exists(temp_audio_path):
            try:
                os.remove(temp_audio_path)
            except Exception:
                pass


# ---------------------------------------------------------------------------
# POST /api/transcribe Endpoint (Standalone STT)
# ---------------------------------------------------------------------------
@app.post("/api/transcribe")
async def transcribe_endpoint(
    audio: UploadFile = File(..., description="User recorded audio file (e.g. WebM/WAV)"),
    language: Optional[str] = Form(None, description="Optional target language ('en', 'ar')")
):
    """Transcribes an uploaded audio file into text using Groq Whisper Large v3 Turbo."""
    text = await _transcribe_file(audio, language)
    return {"text": text}


# ---------------------------------------------------------------------------
# POST /api/voice-chat Endpoint (Full STT + LLM Pipeline)
# ---------------------------------------------------------------------------
@app.post("/api/voice-chat")
async def voice_chat_endpoint(
    audio: UploadFile = File(..., description="User recorded audio file (e.g. WebM/WAV/MP3)"),
    app_context: str = Form(..., description="Real-time RPG & study snapshot context string or JSON"),
    language: Optional[str] = Form(None, description="Optional target language ('en', 'ar', etc.)"),
    history: Optional[str] = Form(None, description="Optional previous JSON conversation turns")
):
    """
    1. Transcribes incoming user speech via Groq whisper-large-v3-turbo (STT).
    2. Constructs RPG study context prompt & generates coaching response with llama-3.1-8b-instant.
    3. Returns JSON: { 'user_transcript': str, 'ai_response': str }.
    """
    user_transcript = await _transcribe_file(audio, language)
    client = get_groq_client()

    if not user_transcript:
        is_ar_req = (language == "ar")
        return {
            "user_transcript": "",
            "ai_response": "لم أتمكن من سماعك بوضوح. يرجى التحدث في المايك مرة أخرى!" if is_ar_req else "I didn't catch that. Please speak clearly into your microphone!"
        }

    # Step B: Build System & History Messages for LLM
    is_arabic = (language == "ar") or any("\u0600" <= c <= "\u06FF" for c in user_transcript)

    if is_arabic:
        system_prompt = f"""أنت مدرب دراسي ذكي ومحفز وخبير (AI Study Coach) لطالب يستخدم لوحة تحكم دراسية تعتمد على أسلوب تقمص الأدوار (RPG).
لديك وصول كامل ومباشر إلى جميع بيانات دراسته ومهامه وساعات تركيزه ووحش اليوم:

بيانات الطالب وسياق اللعبة:
{app_context}

قواعد الإجابة:
1. تحدث باللغة العربية الفصحى الفصيحة والدافئة والمحفزة.
2. اجعل الرد من 2 إلى 3 جمل فقط مناسبة جداً للنطق الصوتي الطبيعي.
3. اذكر إحصائيات ونقاط الخبرة ووحش اليوم لتشجيعه بشكل محدد.
4. تجنب التنسيقات النقطية والأكواد والإيموجي لضمان نطق صوتي سلس.

CRITICAL RULES:

Do NOT repeat the user's question.

Do NOT repeat your own sentences.

Do NOT use excessive punctuation or ellipses (...).

If the user speaks Arabic, reply in natural, concise Arabic and stop generating immediately after answering."""
    else:
        system_prompt = f"""You are an elite, warm, and motivating AI Study & RPG Coach for a student using a gamified RPG study dashboard.
You have real-time access to their study metrics, focus time, boss HP, and active quests.

Student Data & Game Snapshot:
{app_context}

Guidelines:
1. Speak naturally as a wise, friendly mentor on a live voice call.
2. Keep your response concise (2-3 conversational sentences max) — perfect for Text-to-Speech playback.
3. Reference specific data when relevant (e.g. daily focus minutes, level, or boss damage).
4. Do NOT use bullet points, markdown tables, asterisks, or emojis that disrupt speech synthesis.

CRITICAL RULES:

Do NOT repeat the user's question.

Do NOT repeat your own sentences.

Do NOT use excessive punctuation or ellipses (...).

If the user speaks Arabic, reply in natural, concise Arabic and stop generating immediately after answering."""

    messages = [{"role": "system", "content": system_prompt}]

    # Inject optional conversation history if provided
    if history:
        try:
            parsed_history = json.loads(history) if isinstance(history, str) else history
            if isinstance(parsed_history, list):
                for turn in parsed_history[-6:]:
                    role = turn.get("role", "user")
                    content = turn.get("content", "")
                    if content and role in ["user", "assistant"]:
                        messages.append({"role": role, "content": content})
        except Exception:
            pass

    # Append current transcribed user message
    messages.append({"role": "user", "content": user_transcript})

    # Generate response — Try Vercel AI Gateway FIRST (google/gemini-2.5-flash)
    ai_response = ""
    try:
        print("[Voice Chat] → Calling Vercel AI Gateway (google/gemini-2.5-flash)...")
        ai_response = _vercel_chat(messages, max_tokens=300, temperature=0.7)
        print("[Voice Chat] ✓ Vercel AI Gateway response received")
    except Exception as v_err:
        print(f"[Voice Chat] Vercel Gateway failed ({v_err}), falling back to Groq...")

    if not ai_response:
        # Fallback to Groq LLM
        try:
            # Determine best available chat model from client account
            all_models = [m.id for m in client.models.list().data]
            chat_models = [m for m in all_models if not m.startswith("whisper") and "guard" not in m]
            
            if is_arabic:
                preferred_models = ["llama-3.1-8b-instant", "groq/compound-mini", "allam-2-7b", "canopylabs/orpheus-arabic-saudi", "openai/gpt-oss-120b", "openai/gpt-oss-20b", "llama-3.3-70b-versatile"]
            else:
                preferred_models = ["llama-3.1-8b-instant", "groq/compound-mini", "openai/gpt-oss-120b", "openai/gpt-oss-20b", "canopylabs/orpheus-v1-english", "llama-3.3-70b-versatile", "llama3-8b-8192"]
                
            selected_model = next((m for m in preferred_models if m in chat_models), chat_models[0] if chat_models else "llama-3.1-8b-instant")

            completion = client.chat.completions.create(
                model=selected_model,
                messages=messages,
                temperature=0.7,
                max_tokens=250,
                top_p=0.9,
                frequency_penalty=0.6,
                presence_penalty=0.6,
            )
            ai_response = completion.choices[0].message.content.strip()
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Both Vercel & Groq LLM text generation failed: {str(e)}"
            )

    if ai_response:
        ai_response = re.sub(r'(?:\s*\.\s*){2,}', '. ', ai_response)
        ai_response = re.sub(r'(?:\s*[؟?]\s*){2,}', '؟ ', ai_response).strip()

    return {
        "user_transcript": user_transcript,
        "ai_response": ai_response
    }


# ---------------------------------------------------------------------------
# ---------------------------------------------------------------------------
# Amazon Polly TTS Endpoint
# ---------------------------------------------------------------------------

class PollyRequest(BaseModel):
    text: str
    voice_id: Optional[str] = None
    language_code: Optional[str] = "en-US"
    gender: Optional[str] = "female"
    engine: Optional[str] = None

# Voice mapping
POLLY_VOICES = {
    "ar": {
        "female": "Hala",
        "male": "Zayd",
        "standard_female": "Zeina"
    },
    "en": {
        "female": "Joanna",
        "male": "Matthew"
    }
}

_polly_client = None

def get_polly_client():
    global _polly_client
    if _polly_client is not None:
        return _polly_client
    
    # Get AWS credentials from environment
    aws_access_key = os.environ.get("VITE_AWS_ACCESS_KEY_ID") or os.environ.get("AWS_ACCESS_KEY_ID")
    aws_secret_key = os.environ.get("VITE_AWS_SECRET_ACCESS_KEY") or os.environ.get("AWS_SECRET_ACCESS_KEY")
    aws_region = os.environ.get("VITE_AWS_REGION") or os.environ.get("AWS_REGION") or "us-east-1"
    
    # Fallback: read from .env file
    if not aws_access_key or not aws_secret_key:
        env_path = os.path.join(os.path.dirname(__file__), ".env")
        if os.path.exists(env_path):
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line.startswith("VITE_AWS_ACCESS_KEY_ID="):
                        aws_access_key = line.split("=", 1)[1].strip().strip('"\'')
                    elif line.startswith("VITE_AWS_SECRET_ACCESS_KEY="):
                        aws_secret_key = line.split("=", 1)[1].strip().strip('"\'')
                    elif line.startswith("VITE_AWS_REGION="):
                        aws_region = line.split("=", 1)[1].strip().strip('"\'')
    
    if not aws_access_key or not aws_secret_key:
        print("[Polly] ERROR: AWS credentials not found in environment or .env file")
        raise HTTPException(
            status_code=500,
            detail="AWS credentials not configured. Please set VITE_AWS_ACCESS_KEY_ID and VITE_AWS_SECRET_ACCESS_KEY"
        )
    
    _polly_client = boto3.client(
        'polly',
        aws_access_key_id=aws_access_key,
        aws_secret_access_key=aws_secret_key,
        region_name=aws_region
    )
    return _polly_client


@app.post("/api/polly-tts")
def polly_tts(request: PollyRequest):
    """
    Amazon Polly TTS synthesis endpoint (runs in threadpool for non-blocking I/O).
    Handles AWS credentials server-side for security and browser compatibility.
    """
    try:
        polly_client = get_polly_client()
        
        # Determine voice
        is_arabic = bool(
            request.language_code and (
                request.language_code.startswith("ar") or request.language_code == "arb"
            )
        ) or any("\u0600" <= c <= "\u06FF" for c in request.text)
        
        lang = "ar" if is_arabic else "en"
        gender = (request.gender or "female").lower()
        
        if request.voice_id and request.voice_id in ["Hala", "Zayd", "Zeina", "Joanna", "Matthew", "Amy", "Brian", "Emma", "Olivia"]:
            voice_id = request.voice_id
        else:
            voice_id = POLLY_VOICES[lang].get(gender, POLLY_VOICES[lang]["female"])
        
        # Engine: Zeina is standard only; Hala, Zayd, Joanna, Matthew support neural
        if request.engine:
            engine = request.engine
        elif voice_id in ["Zeina"]:
            engine = "standard"
        else:
            engine = "neural"
        
        print(f"[Polly] Synthesizing: voice={voice_id}, engine={engine}, chars={len(request.text)}, lang={lang}")
        
        # Request speech synthesis without LanguageCode constraint to avoid ValidationException
        synthesis_kwargs = {
            "Text": request.text,
            "OutputFormat": "mp3",
            "VoiceId": voice_id,
            "Engine": engine
        }
        
        response = polly_client.synthesize_speech(**synthesis_kwargs)
        
        # Read audio stream
        if "AudioStream" in response:
            audio_data = response["AudioStream"].read()
            print(f"[Polly] [SUCCESS] Generated {len(audio_data)} bytes of audio ({voice_id})")
            
            return Response(
                content=audio_data,
                media_type="audio/mpeg",
                headers={
                    "Content-Disposition": "inline; filename=speech.mp3",
                    "Content-Length": str(len(audio_data)),
                    "Access-Control-Allow-Origin": "*",
                }
            )
        else:
            raise HTTPException(status_code=500, detail="No audio stream in Polly response")
            
    except (BotoCoreError, ClientError) as error:
        print(f"[Polly] AWS Error: {error}")
        raise HTTPException(status_code=500, detail=f"AWS Polly error: {str(error)}")
    except HTTPException:
        raise
    except Exception as e:
        print(f"[Polly] Unexpected error: {e}")
        raise HTTPException(status_code=500, detail=f"Polly synthesis failed: {str(e)}")


# ---------------------------------------------------------------------------
# POST /api/harvest-flashcards — AI-powered flashcard extraction
# ---------------------------------------------------------------------------
class HarvestRequest(BaseModel):
    text: str
    subject_tag: str = "General"


@app.post("/api/harvest-flashcards")
async def harvest_flashcards(request: HarvestRequest):
    """
    Takes a large text input (e.g., full lecture transcript, up to 1M tokens)
    and returns a JSON array of structured flashcards extracted by MiniMax M3.

    Each card: { "question": str, "answer": str, "subject_tag": str, "difficulty": "easy"|"medium"|"hard" }
    """
    if not request.text or not request.text.strip():
        raise HTTPException(status_code=400, detail="Input text is empty.")

    char_count = len(request.text)
    print(f"[Harvest] Received {char_count:,} chars | subject_tag={request.subject_tag!r}")

    system_prompt = f"""You are an expert educational flashcard generator with deep knowledge in {request.subject_tag}.

TASK: Analyze the provided study text and extract high-quality Q&A flashcards.

OUTPUT FORMAT — You MUST return ONLY a valid JSON array. No markdown, no code blocks, no explanation. Just raw JSON.
Each element must follow this exact schema:
{{
  "question": "A clear, specific question testing one concept",
  "answer": "A concise, accurate answer (1-3 sentences max)",
  "subject_tag": "{request.subject_tag}",
  "difficulty": "easy" | "medium" | "hard"
}}

RULES:
1. Extract 10-50 cards depending on content density.
2. Prefer "what", "how", "why", "define", "explain" question types.
3. Make answers self-contained — no references to "the text" or "above".
4. Assign difficulty: easy=definition/recall, medium=application, hard=synthesis/analysis.
5. Cover ALL major concepts, not just the first few paragraphs.
6. RETURN ONLY THE JSON ARRAY. Nothing else."""

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": f"Extract flashcards from this study material:\n\n{request.text}"},
    ]

    raw_content = _vercel_chat(messages, max_tokens=8192, temperature=0.2)

    # Parse and validate JSON
    try:
        # Strip any accidental markdown code fences the model may add
        clean = raw_content.strip()
        if clean.startswith("```"):
            clean = "\n".join(clean.split("\n")[1:])
        if clean.endswith("```"):
            clean = "\n".join(clean.split("\n")[:-1])
        clean = clean.strip()

        cards = json.loads(clean)
        if not isinstance(cards, list):
            raise ValueError("Response is not a JSON array.")

        # Validate each card
        valid_cards = []
        for card in cards:
            if isinstance(card, dict) and card.get("question") and card.get("answer"):
                valid_cards.append({
                    "question": str(card["question"]).strip(),
                    "answer": str(card["answer"]).strip(),
                    "subject_tag": str(card.get("subject_tag", request.subject_tag)).strip(),
                    "difficulty": card.get("difficulty", "medium") if card.get("difficulty") in ("easy", "medium", "hard") else "medium",
                })

        if not valid_cards:
            raise ValueError("No valid cards parsed from AI response.")

        print(f"[Harvest] \u2713 Extracted {len(valid_cards)} cards from {char_count:,} chars")
        return {"cards": valid_cards, "count": len(valid_cards), "model": VERCEL_MODEL}

    except (json.JSONDecodeError, ValueError) as e:
        print(f"[Harvest] JSON parse error: {e}\nRaw output (first 500 chars): {raw_content[:500]}")
        raise HTTPException(
            status_code=422,
            detail=f"AI returned invalid JSON: {str(e)}. Try with a shorter or more structured text."
        )


# ---------------------------------------------------------------------------
# POST /api/analyze-telemetry — Distraction DNA Report
# ---------------------------------------------------------------------------
class TelemetryRequest(BaseModel):
    telemetry: dict


@app.post("/api/analyze-telemetry")
async def analyze_telemetry(request: TelemetryRequest):
    """
    Accepts the full localStorage blob from the React frontend (time logs,
    mood logs, pomodoro data, study habits) and returns a personalized
    Distraction DNA Report generated by MiniMax M3.

    Output JSON:
    {
      "peak_focus_hours": [...],
      "distraction_fingerprint": "...",
      "mood_correlation": "...",
      "schedule_advice": [...],
      "verdict": "..."
    }
    """
    if not request.telemetry:
        raise HTTPException(status_code=400, detail="Telemetry data is empty.")

    telemetry_json = json.dumps(request.telemetry, ensure_ascii=False, indent=2)
    print(f"[Telemetry] Received {len(telemetry_json):,} chars of study telemetry for analysis")

    system_prompt = """You are an elite Cognitive Data Analyst and Behavioral Scientist specializing in student productivity.
You have been given a complete JSON export of a student's Study Hub RPG localStorage — containing study session logs, mood entries, pomodoro records, time tracking, and behavioral metadata.

TASK: Analyze this data and produce a highly personalized "Distraction DNA Report".

OUTPUT FORMAT — Return ONLY a single valid JSON object (no markdown, no code blocks):
{
  "peak_focus_hours": ["HH:00–HH:00", ...],
  "distraction_fingerprint": "2-3 sentence summary of the student's primary distraction patterns and triggers",
  "mood_correlation": "2-3 sentence analysis of correlation between mood/energy levels and session success or failure",
  "schedule_advice": [
    "Specific actionable advice 1",
    "Specific actionable advice 2",
    "Specific actionable advice 3"
  ],
  "verdict": "One powerful paragraph — the agent's overall verdict on this student's distraction DNA, their main vulnerability, and their hidden strength"
}

ANALYSIS GUIDELINES:
- Be brutally specific — reference actual data patterns, not generic advice.
- Identify time slots with highest and lowest study output.
- Look for correlations: low mood → session failure, late hours → pomodoro abandonment, etc.
- If data is sparse, infer from what IS available and note the limitation.
- Use detective-style, precise, analytical language. No fluff.
- RETURN ONLY THE JSON OBJECT. Nothing else."""

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": f"Analyze this student telemetry data:\n\n{telemetry_json}"},
    ]

    raw_content = _vercel_chat(messages, max_tokens=2048, temperature=0.4)

    # Parse and validate JSON
    try:
        clean = raw_content.strip()
        if clean.startswith("```"):
            clean = "\n".join(clean.split("\n")[1:])
        if clean.endswith("```"):
            clean = "\n".join(clean.split("\n")[:-1])
        clean = clean.strip()

        report = json.loads(clean)
        if not isinstance(report, dict):
            raise ValueError("Response is not a JSON object.")

        print(f"[Telemetry] \u2713 Distraction DNA Report generated successfully")
        return {"report": report, "model": VERCEL_MODEL}

    except (json.JSONDecodeError, ValueError) as e:
        print(f"[Telemetry] JSON parse error: {e}\nRaw (first 500): {raw_content[:500]}")
        raise HTTPException(
            status_code=422,
            detail=f"AI returned invalid JSON: {str(e)}"
        )


# ---------------------------------------------------------------------------
# Direct Execution Entry Point
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    print("=========================================================", flush=True)
    print(" Starting AI Voice Coach FastAPI Backend on port 8000...", flush=True)
    print(" STT: Groq whisper-large-v3-turbo", flush=True)
    print(" LLM: Groq llama-3.1-8b-instant", flush=True)
    print(" TTS: Amazon Polly (Arabic Hala/Zayd + English Joanna/Matthew)", flush=True)
    print(" AI Gateway: Vercel (google/gemini-2.5-flash)", flush=True)
    print(" Flashcards: POST http://127.0.0.1:8000/api/harvest-flashcards", flush=True)
    print(" Telemetry: POST http://127.0.0.1:8000/api/analyze-telemetry", flush=True)
    print(" Endpoint: POST http://127.0.0.1:8000/api/voice-chat", flush=True)
    print(" Polly TTS: POST http://127.0.0.1:8000/api/polly-tts", flush=True)
    print("=========================================================", flush=True)
    should_reload = os.environ.get("UVICORN_RELOAD", "false").lower() in ("true", "1")
    uvicorn.run("server:app", host="127.0.0.1", port=8000, reload=should_reload, log_level="info")

