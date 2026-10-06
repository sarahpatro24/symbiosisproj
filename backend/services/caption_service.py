import httpx
from indic_transliteration import sanscript
from indic_transliteration.sanscript import transliterate
import asyncio
import urllib.parse

LANG_CONFIG = {
    "telugu": {
        "google_code": "te",
        "script": sanscript.TELUGU,
    },
    "hindi": {
        "google_code": "hi",
        "script": sanscript.DEVANAGARI,
    },
    "tamil": {
        "google_code": "ta",
        "script": sanscript.TAMIL,
    },
}

def _translate_batch(texts: list[str], target_lang: str) -> list[str]:
    """
    Uses Google Translate unofficial endpoint.
    Joins texts with a separator, translates in one request, splits back.
    """
    separator = " ||| "
    joined = separator.join(texts)
    
    url = "https://translate.googleapis.com/translate_a/single"
    params = {
        "client": "gtx",
        "sl": "en",
        "tl": target_lang,
        "dt": "t",
        "q": joined,
    }
    
    with httpx.Client(timeout=30) as client:
        response = client.get(url, params=params)
        data = response.json()
    
    # Extract translated text from nested response
    translated_joined = ""
    for item in data[0]:
        if item[0]:
            translated_joined += item[0]
    
    # Split back into individual chunks
    translated_parts = translated_joined.split(separator)
    
    # If split count doesn't match, fall back to repeating the full translation
    if len(translated_parts) != len(texts):
        return [translated_joined] * len(texts)
    
    return [p.strip() for p in translated_parts]

def _romanize_chunk(text: str, script) -> str:
    try:
        return transliterate(text, script, sanscript.ITRANS)
    except Exception:
        return text

def _process_captions(chunks: list[dict], language: str) -> list[dict]:
    meaningful_chunks = [
        c for c in chunks
        if c.get("text", "").strip() and any(ch.isalpha() for ch in c["text"])
    ]

    if not meaningful_chunks:
        raise ValueError("No audio content found in this video to translate.")

    config = LANG_CONFIG[language]
    texts = [c["text"] for c in meaningful_chunks]

    # Translate in batches of 50 to avoid URL length limits
    batch_size = 50
    all_translated = []
    for i in range(0, len(texts), batch_size):
        batch = texts[i:i + batch_size]
        translated = _translate_batch(batch, config["google_code"])
        all_translated.extend(translated)

    # Romanize and build result
    result = []
    for chunk, translated in zip(meaningful_chunks, all_translated):
        romanized = _romanize_chunk(translated, config["script"])
        result.append({"timestamp": chunk["start"], "text": romanized})

    return result

async def process_captions(chunks: list[dict], language: str) -> list[dict]:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _process_captions, chunks, language)