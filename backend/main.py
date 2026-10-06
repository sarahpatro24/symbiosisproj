from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from core.database import connect_db, close_db
from core.config import settings
from routers import video, scores, captions, user, admin
import sys
print("PYTHON EXECUTABLE:", sys.executable)
print("YOUTUBE_TRANSCRIPT_API LOCATION:", end=" ")
try:
    import youtube_transcript_api
    print(youtube_transcript_api.__file__)
    from youtube_transcript_api import YouTubeTranscriptApi
    print("HAS get_transcript:", hasattr(YouTubeTranscriptApi, 'get_transcript'))
except Exception as e:
    print("ERROR:", e)
@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await close_db()

app = FastAPI(title="VidLearn API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(video.router, prefix="/api")
app.include_router(scores.router, prefix="/api")
app.include_router(captions.router, prefix="/api")
app.include_router(user.router, prefix="/api/user")
app.include_router(admin.router, prefix="/api")

@app.get("/health")
async def health():
    return {"status": "ok"}