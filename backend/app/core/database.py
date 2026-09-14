import os
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from app.core.config import settings

db_url = settings.DATABASE_URL

if db_url:
    # 1. Neon DB URLs handle karna (postgresql:// ko postgresql+asyncpg:// mein badalna)
    if db_url.startswith("postgresql://"):
        db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)
    
    # 2. URL se ?sslmode=require ko remove karna ([0] lazmi hai)
    if "?" in db_url:
        db_url = db_url.split("?")[0]

# 3. Asynchronous Engine banana (SSL ko connect_args ke zariye pass karna)
engine = create_async_engine(
    db_url, 
    echo=settings.DEBUG,
    connect_args={"ssl": "require"}  # Yeh asyncpg ke liye perfect hai
)

# 4. Session factory banana
async_session = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

Base = declarative_base()

async def get_db():
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()
