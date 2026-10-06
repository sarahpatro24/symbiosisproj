from fastapi import APIRouter, Depends, HTTPException
from models.schemas import CaptionsRequest
from services.auth import get_current_user
from services import youtube_service, caption_service
from core.database import get_db

router = APIRouter()

VALID_LANGUAGES = {"telugu", "hindi", "tamil"}

@router.post("/captions")
async def get_captions(body: CaptionsRequest, user=Depends(get_current_user)):
    if body.language not in VALID_LANGUAGES:
        raise HTTPException(status_code=400, detail="Invalid language choice")

    try:
        transcript = await youtube_service.get_transcript(body.youtube_url)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    try:
        captions = await caption_service.process_captions(transcript, body.language)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Caption processing failed: {str(e)}")

    # Track caption mode used
    db = get_db()
    await db.user_video_sessions.update_one(
        {"user_id": user["user_id"], "youtube_url": body.youtube_url},
        {"$set": {"caption_mode_used": body.language}},
    )

    return {"captions": captions}