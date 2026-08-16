from fastapi import FastAPI, APIRouter, HTTPException, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import requests


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# ==================== YouTube Search Proxy ====================
YOUTUBE_API_KEY = os.environ.get('YOUTUBE_API_KEY')
YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search"
YOUTUBE_VIDEOS_URL = "https://www.googleapis.com/youtube/v3/videos"


class VideoItem(BaseModel):
    video_id: str
    title: str
    thumbnail: str
    channel_title: str
    duration: Optional[str] = None


class SearchResponse(BaseModel):
    items: List[VideoItem]
    nextPageToken: Optional[str] = None


@api_router.get("/youtube/search", response_model=SearchResponse)
async def youtube_search(
    q: str = Query(..., min_length=1, description="Search query"),
    pageToken: Optional[str] = Query(None),
    maxResults: int = Query(12, ge=1, le=25),
):
    """Proxy YouTube Data API v3 search to keep the API key server-side."""
    if not YOUTUBE_API_KEY:
        raise HTTPException(status_code=500, detail="YouTube API key not configured")

    params = {
        "part": "snippet",
        "q": q,
        "type": "video",
        "maxResults": maxResults,
        "key": YOUTUBE_API_KEY,
        "videoEmbeddable": "true",
        "safeSearch": "none",
        "relevanceLanguage": "es",
    }
    if pageToken:
        params["pageToken"] = pageToken

    try:
        resp = requests.get(YOUTUBE_SEARCH_URL, params=params, timeout=15)
    except requests.RequestException as e:
        logger.error(f"YouTube request failed: {e}")
        raise HTTPException(status_code=502, detail="Error al conectar con YouTube")

    if resp.status_code != 200:
        logger.error(f"YouTube API error {resp.status_code}: {resp.text}")
        detail = "Error de YouTube API"
        try:
            err = resp.json().get("error", {})
            detail = err.get("message", detail)
        except Exception:
            pass
        raise HTTPException(status_code=resp.status_code, detail=detail)

    data = resp.json()
    items = []
    for it in data.get("items", []):
        vid = it.get("id", {}).get("videoId")
        snippet = it.get("snippet", {})
        if not vid:
            continue
        thumbnails = snippet.get("thumbnails", {})
        thumb = (
            thumbnails.get("high", {}).get("url")
            or thumbnails.get("medium", {}).get("url")
            or thumbnails.get("default", {}).get("url", "")
        )
        items.append(
            VideoItem(
                video_id=vid,
                title=snippet.get("title", ""),
                thumbnail=thumb,
                channel_title=snippet.get("channelTitle", ""),
            )
        )

    return SearchResponse(items=items, nextPageToken=data.get("nextPageToken"))


# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()