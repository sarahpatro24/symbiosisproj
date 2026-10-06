from motor.motor_asyncio import AsyncIOMotorClient
from core.config import settings
import certifi

client = None
db = None

async def connect_db():
    global client, db
    client = AsyncIOMotorClient(
        settings.MONGODB_URI,
        tlsCAFile=certifi.where()
    )
    db = client.vidlearn
    print("MongoDB connected")

async def close_db():
    global client
    if client:
        client.close()

def get_db():
    return db