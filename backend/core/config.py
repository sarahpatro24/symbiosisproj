from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    MONGODB_URI: str
    SUPABASE_URL: str
    SUPABASE_SERVICE_ROLE_KEY: str
    GROQ_API_KEY: str
    FRONTEND_URL: str = "http://localhost:5173"
    ADMIN_EMAIL: str
    YOUTUBE_API_KEY: str

    class Config:
        env_file = ".env"

settings = Settings()