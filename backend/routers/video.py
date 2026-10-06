from fastapi import APIRouter, Depends, HTTPException
from services import ai_service
from models.schemas import VideoSessionRequest, SynopsisRequest, QuizRequest
from services.auth import get_current_user
from services import youtube_service
from core.database import get_db
from datetime import datetime, timezone

router = APIRouter()

@router.post("/video-session")
async def create_or_update_session(
    body: VideoSessionRequest,
    user=Depends(get_current_user),
):
    db = get_db()
    url = body.youtube_url
    user_id = user["user_id"]
    now = datetime.now(timezone.utc)

    existing = await db.user_video_sessions.find_one({"user_id": user_id, "youtube_url": url})

    if existing and existing.get("synopsis"):
        await db.user_video_sessions.update_one(
        {"user_id": user_id, "youtube_url": url},
        {"$set": {"last_viewed_at": now}},
    )
        existing.pop("_id", None)
        return {"status": "updated", "session": existing}

    print("NEW SESSION - fetching transcript now")
    try:
        info = await youtube_service.get_video_info(url)
        print("Video info fetched OK")
    except Exception as e:
        print(f"Video info failed: {e}")
        raise HTTPException(status_code=400, detail="Could not fetch video info.")

    try:
        transcript = await youtube_service.get_transcript(url)
        print(f"Transcript fetched OK - {len(transcript)} chunks")
    except ValueError as e:
        print(f"Transcript failed: {e}")
        raise HTTPException(status_code=422, detail=str(e))

    print("Generating synopsis...")
    synopsis = ai_service.generate_synopsis(transcript)
    print("Generating quiz...")
    quiz = ai_service.generate_quiz(synopsis)

    doc = {
        "user_id": user_id,
        "youtube_url": url,
        "video_title": info["title"],
        "thumbnail_url": info["thumbnail_url"],
        "synopsis": synopsis,
        "quiz": quiz,
        "caption_mode_used": None,
        "last_viewed_at": now,
        "created_at": now,
    }
    await db.user_video_sessions.insert_one(doc)
    doc.pop("_id", None)
    return {"status": "created", "session": doc}


@router.post("/synopsis")
async def get_synopsis(body: SynopsisRequest, user=Depends(get_current_user)):
    db = get_db()
    session = await db.user_video_sessions.find_one(
        {"user_id": user["user_id"], "youtube_url": body.youtube_url}
    )
    if not session or not session.get("synopsis"):
        raise HTTPException(status_code=404, detail="Synopsis not found. Load the video first.")
    return {"synopsis": session["synopsis"]}


@router.post("/quiz")
async def get_quiz(body: QuizRequest, user=Depends(get_current_user)):
    db = get_db()
    session = await db.user_video_sessions.find_one(
        {"user_id": user["user_id"], "youtube_url": body.youtube_url}
    )
    if not session or not session.get("quiz"):
        raise HTTPException(status_code=404, detail="Quiz not found. Load the video first.")
    return {"quiz": session["quiz"]}