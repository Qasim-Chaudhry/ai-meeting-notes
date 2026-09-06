from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base  # Database engine aur Base models import kiye
from app.routers import meetings, action_items, auth

# 1. Lifespan handler jo application start hote hi Neon DB mein tables bana dega
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Live Neon cloud database par automatic sari tables create karega
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

# 2. FastAPI Initialization with lifespan
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    lifespan=lifespan, # Yeh line add ki
)

# 3. CORS Middleware Configuration
# Production mein Render backend par multiple origins handle karne ke liye "*" allow kar rahe hain test phase ke liye
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # settings.FRONTEND_URL ki jagah "*" kiya taake deployment par origin error na aaye
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4. Routers Include
app.include_router(meetings.router)
app.include_router(action_items.router)
app.include_router(auth.router)

# 5. Core Routes
@app.get("/")
def root():
    return {"message": "AI Meeting Notes API is running"}

@app.get("/health")
def health():
    return {"status": "healthy"}
