from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client
from core.config import settings   # won't work — fix import below
from core.database import get_db

security = HTTPBearer()

supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials
    try:
        response = supabase.auth.get_user(token)
        supabase_user = response.user
        if not supabase_user:
            raise HTTPException(status_code=401, detail="Invalid token")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    db = get_db()
    user_doc = await db.users.find_one({"user_id": supabase_user.id})

    # Determine correct role based on fixed admin email
    correct_role = "admin" if supabase_user.email == settings.ADMIN_EMAIL else "user"

    if not user_doc:
        user_doc = {
            "user_id": supabase_user.id,
            "name": supabase_user.user_metadata.get("full_name", ""),
            "email": supabase_user.email,
            "role": correct_role,
            "created_at": supabase_user.created_at,
        }
        await db.users.insert_one(user_doc)
    elif user_doc.get("role") != correct_role:
        # Keep role in sync with the fixed admin email rule
        await db.users.update_one(
            {"user_id": supabase_user.id},
            {"$set": {"role": correct_role}}
        )
        user_doc["role"] = correct_role

    return user_doc

async def require_admin(user=Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user