import os
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base

# 1. .env file se variables ko load karna
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL env variable mein missing hai!")

# 2. Asynchronous Engine banana (PostgreSQL ke liye)
engine = create_async_engine(DATABASE_URL, echo=True)

# 3. Session factory banana jo har request par DB connection degi
async_session = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# 4. Base class banana jise use kar ke hum database tables (Models) banayenge
Base = declarative_base()

# 5. Dependency Injector function (FastAPI routes mein use karne ke liye)
async def get_db():
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()
