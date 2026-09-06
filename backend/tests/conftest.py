import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker

from app.main import app
from app.core.database import Base, get_db

TEST_DATABASE_URL = "postgresql+asyncpg://ipesim:ipesim_dev_password@localhost:5432/ai_meeting_db_test"

test_engine = create_async_engine(TEST_DATABASE_URL)
TestSessionLocal = async_sessionmaker(bind=test_engine, expire_on_commit=False)


@pytest.fixture(scope="session", autouse=True)
async def setup_test_db():
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture(autouse=True)
async def clean_tables():
    yield
    async with TestSessionLocal() as session:
        # YAHAN BADLAV KIYA HAI: Pehle action_items aur meetings tables clear ho rahi thin, ab users bhi hogi
        await session.execute(__import__("sqlalchemy").text("DELETE FROM action_items"))
        await session.execute(__import__("sqlalchemy").text("DELETE FROM meetings"))
        await session.execute(__import__("sqlalchemy").text("DELETE FROM users"))
        await session.commit()


async def override_get_db():
    async with TestSessionLocal() as session:
        yield session


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.fixture
async def test_user_token(client):
    """Registers a test user and returns their access token."""
    await client.post(
        "/api/auth/register",
        json={"email": "testuser@example.com", "password": "testpassword123"},
    )
    response = await client.post(
        "/api/auth/login",
        data={"username": "testuser@example.com", "password": "testpassword123"},
    )
    return response.json()["access_token"]


@pytest.fixture
async def auth_headers(test_user_token):
    """Authorization header dict to pass into requests."""
    return {"Authorization": f"Bearer {test_user_token}"}
