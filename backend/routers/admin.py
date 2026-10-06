from fastapi import APIRouter, Depends
from services.auth import require_admin
from core.database import get_db
from datetime import datetime, timedelta, timezone

router = APIRouter()


@router.get("/admin/users")
async def get_all_users(admin=Depends(require_admin)):
    db = get_db()
    users = await db.users.find({}, {"_id": 0}).to_list(1000)
    return {"users": users}


@router.get("/admin/user/{user_id}/history")
async def get_user_history_admin(user_id: str, admin=Depends(require_admin)):
    db = get_db()

    sessions = await db.user_video_sessions.find(
        {"user_id": user_id}
    ).sort("last_viewed_at", -1).limit(10).to_list(10)

    urls = [s["youtube_url"] for s in sessions]
    scores_list = await db.user_quiz_scores.find(
        {"user_id": user_id, "youtube_url": {"$in": urls}}
    ).to_list(100)
    scores_map = {s["youtube_url"]: s["score"] for s in scores_list}

    # Personal average score across ALL attempted quizzes (not just last 10)
    all_scores = await db.user_quiz_scores.find({"user_id": user_id}).to_list(10000)
    avg = (sum(s["score"] for s in all_scores) / len(all_scores)) if all_scores else None

    history = []
    for s in sessions:
        url = s["youtube_url"]
        history.append({
            "youtube_url": url,
            "video_title": s.get("video_title"),
            "thumbnail_url": s.get("thumbnail_url"),
            "last_viewed_at": s.get("last_viewed_at"),
            "quiz_attempted": url in scores_map,
            "latest_score": scores_map.get(url),
        })

    return {"history": history, "average_score": avg}


@router.get("/admin/stats")
async def get_admin_stats(admin=Depends(require_admin)):
    db = get_db()

    # Platform-wide totals
    total_users = await db.users.count_documents({})
    total_videos = await db.user_video_sessions.count_documents({})
    distinct_urls = await db.user_video_sessions.distinct("youtube_url")
    unique_videos = len(distinct_urls)

    # All quiz scores — used for average + distribution
    scores_cursor = db.user_quiz_scores.find({}, {"score": 1})
    all_scores = [doc["score"] async for doc in scores_cursor]
    total_attempts = len(all_scores)
    platform_avg = round(sum(all_scores) / total_attempts, 2) if total_attempts else 0

    # Score distribution buckets
    buckets = {"0-2": 0, "3-4": 0, "5-6": 0, "7-8": 0, "9-10": 0}
    for s in all_scores:
        if s <= 2: buckets["0-2"] += 1
        elif s <= 4: buckets["3-4"] += 1
        elif s <= 6: buckets["5-6"] += 1
        elif s <= 8: buckets["7-8"] += 1
        else: buckets["9-10"] += 1

    # Caption language usage breakdown
    lang_cursor = db.user_video_sessions.aggregate([
        {"$match": {"caption_mode_used": {"$ne": None}}},
        {"$group": {"_id": "$caption_mode_used", "count": {"$sum": 1}}}
    ])
    language_usage = {doc["_id"]: doc["count"] async for doc in lang_cursor}

    # Daily activity trend — last 7 days
    seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)
    trend_cursor = db.user_video_sessions.aggregate([
        {"$match": {"last_viewed_at": {"$gte": seven_days_ago}}},
        {"$group": {
            "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$last_viewed_at"}},
            "count": {"$sum": 1}
        }},
        {"$sort": {"_id": 1}}
    ])
    daily_trend = [{"date": doc["_id"], "count": doc["count"]} async for doc in trend_cursor]

    # Per-user average score + attempt count (powers the leaderboard)
    pipeline = [
        {"$group": {"_id": "$user_id", "avg_score": {"$avg": "$score"}, "attempts": {"$sum": 1}}},
    ]
    per_user_stats = await db.user_quiz_scores.aggregate(pipeline).to_list(1000)

    return {
        "total_users": total_users,
        "total_video_views": total_videos,
        "unique_videos": unique_videos,
        "total_quiz_attempts": total_attempts,
        "platform_average_score": platform_avg,
        "score_distribution": buckets,
        "language_usage": language_usage,
        "daily_trend": daily_trend,
        "per_user_stats": per_user_stats,
    }
