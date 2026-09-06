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
import ssl
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from app.core.config import settings

# 1. Neon DB URLs handle karna (postgresql:// ko postgresql+asyncpg:// mein badalna agar settings mein nahi badla)
db_url = settings.DATABASE_URL
if db_url and db_url.startswith("postgresql://"):
    db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)

# 2. Production/Neon ke liye SSL setup karna
connect_args = {}
if db_url and "localhost" not in db_url and "127.0.0.1" not in db_url:
    # Neon cloud production ke liye SSL connection lazmi hai
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    connect_args["ssl"] = ctx

# 3. Asynchronous Engine banana
engine = create_async_engine(
    db_url, 
    echo=settings.DEBUG,
    connect_args=connect_args
)

# 4. Session factory banana jo har request par DB connection degi
async_session = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# 5. Base class banana jise use kar ke hum database tables (Models) banayenge
Base = declarative_base()

# 6. Dependency Injector function (FastAPI routes mein use karne ke liye)
async def get_db():
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()
