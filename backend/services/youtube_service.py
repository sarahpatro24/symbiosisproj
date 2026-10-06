import httpx
import asyncio
import re
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import TranscriptsDisabled, NoTranscriptFound
from core.config import settings

def extract_video_id(url: str) -> str:
    patterns = [
        r'(?:v=|\/)([0-9A-Za-z_-]{11})',
        r'youtu\.be\/([0-9A-Za-z_-]{11})'
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    raise ValueError("Invalid YouTube URL")


async def get_video_info(youtube_url: str) -> dict:
    """Returns title and thumbnail URL using YouTube Data API v3."""
    video_id = extract_video_id(youtube_url)
    url = "https://www.googleapis.com/youtube/v3/videos"
    params = {
        "part": "snippet",
        "id": video_id,
        "key": settings.YOUTUBE_API_KEY,
    }
    async with httpx.AsyncClient() as client:
        res = await client.get(url, params=params)
        data = res.json()

    items = data.get("items", [])
    if not items:
        raise ValueError("Video not found or unavailable")

    snippet = items[0]["snippet"]
    thumbnail = (
        snippet.get("thumbnails", {}).get("high", {}).get("url") or
        snippet.get("thumbnails", {}).get("default", {}).get("url") or ""
    )
    return {
        "title": snippet.get("title", "Untitled"),
        "thumbnail_url": thumbnail,
    }


async def get_transcript(youtube_url: str) -> list[dict]:
    """Returns list of {start, text} dicts using youtube-transcript-api."""
    def _fetch():
        video_id = extract_video_id(youtube_url)
        try:
            from youtube_transcript_api import YouTubeTranscriptApi
            ytt = YouTubeTranscriptApi()
            transcript = ytt.fetch(video_id)
            return [{"start": chunk.start, "text": chunk.text} for chunk in transcript]
        except Exception as e:
            raise ValueError(f"Could not fetch transcript: {str(e)}")

    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _fetch)