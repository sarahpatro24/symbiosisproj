from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# ── Requests ──────────────────────────────────────────────
class VideoSessionRequest(BaseModel):
    youtube_url: str

class SynopsisRequest(BaseModel):
    youtube_url: str

class QuizRequest(BaseModel):
    youtube_url: str

class SubmitScoreRequest(BaseModel):
    youtube_url: str
    score: int          # 0-10

class CaptionsRequest(BaseModel):
    youtube_url: str
    language: str       # "telugu" | "hindi" | "tamil"

# ── Responses ─────────────────────────────────────────────
class QuizOption(BaseModel):
    key: str            # "A" | "B" | "C" | "D"
    text: str

class QuizQuestion(BaseModel):
    question: str
    options: List[QuizOption]
    answer: str         # "A" | "B" | "C" | "D"

class CaptionChunk(BaseModel):
    timestamp: float
    text: str

class VideoHistoryItem(BaseModel):
    youtube_url: str
    video_title: Optional[str]
    thumbnail_url: Optional[str]
    last_viewed_at: datetime
    quiz_attempted: bool
    latest_score: Optional[int]

class AdminUserItem(BaseModel):
    user_id: str
    name: str
    email: str
    created_at: datetime
    average_score: Optional[float]
    history: Optional[List[VideoHistoryItem]]