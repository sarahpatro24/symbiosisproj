from fastapi import APIRouter, Depends
from models.schemas import SubmitScoreRequest
from services.auth import get_current_user
from core.database import get_db
from datetime import datetime, timezone

router = APIRouter()

@router.post("/submit-score")
async def submit_score(body: SubmitScoreRequest, user=Depends(get_current_user)):
    db = get_db()
    now = datetime.now(timezone.utc)
    await db.user_quiz_scores.update_one(
        {"user_id": user["user_id"], "youtube_url": body.youtube_url},
        {"$set": {"score": body.score, "submitted_at": now}},
        upsert=True,
    )
    return {"status": "ok", "score": body.score}