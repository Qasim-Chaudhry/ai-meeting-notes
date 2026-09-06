# from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
# from sqlalchemy.orm import declarative_base

# from app.core.config import settings

# # 1. Asynchronous Engine banana (PostgreSQL ke liye)
# engine = create_async_engine(settings.DATABASE_URL, echo=settings.DEBUG)

# # 2. Session factory banana jo har request par DB connection degi
# async_session = async_sessionmaker(
#     bind=engine,
#     class_=AsyncSession,
#     expire_on_commit=False
# )

# # 3. Base class banana jise use kar ke hum database tables (Models) banayenge
# Base = declarative_base()

# # 4. Dependency Injector function (FastAPI routes mein use karne ke liye)
# async def get_db():
#     async with async_session() as session:
#         try:
#             yield session
#         finally:
#             await session.close()
import os
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from app.core.config import settings

# 1. Neon DB URLs handle karna (postgresql:// ko postgresql+asyncpg:// mein badalna)
db_url = settings.DATABASE_URL
if db_url and db_url.startswith("postgresql://"):
    db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)

# 2. Asynchronous Engine banana (Bina kisi extra connect_args ke, SSL url parameters se handle hoga)
engine = create_async_engine(
    db_url, 
    echo=settings.DEBUG
)

# 3. Session factory banana
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
