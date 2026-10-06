from fastapi import APIRouter, Depends
from services.auth import get_current_user
from core.database import get_db

router = APIRouter()

@router.get("/history")
async def get_user_history(user=Depends(get_current_user)):
    db = get_db()
    user_id = user["user_id"]

    sessions = await db.user_video_sessions.find(
        {"user_id": user_id}
    ).sort("last_viewed_at", -1).limit(10).to_list(10)

    urls = [s["youtube_url"] for s in sessions]
    scores_cursor = db.user_quiz_scores.find({"user_id": user_id, "youtube_url": {"$in": urls}})
    scores_list = await scores_cursor.to_list(100)
    scores_map = {s["youtube_url"]: s["score"] for s in scores_list}

    result = []
    for s in sessions:
        url = s["youtube_url"]
        result.append({
            "youtube_url": url,
            "video_title": s.get("video_title"),
            "thumbnail_url": s.get("thumbnail_url"),
            "last_viewed_at": s.get("last_viewed_at"),
            "quiz_attempted": url in scores_map,
            "latest_score": scores_map.get(url),
        })

    return {"history": result}   # ← moved here, belongs to history route


@router.get("/me")
async def get_me(user=Depends(get_current_user)):
    return {
        "user_id": user["user_id"],
        "email": user["email"],
        "role": user.get("role", "user")
    }