import pytest


async def test_register(client):
    response = await client.post(
        "/api/auth/register",
        json={"email": "newuser@example.com", "password": "password123"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "newuser@example.com"
    assert "id" in data


async def test_register_duplicate_email(client):
    await client.post(
        "/api/auth/register",
        json={"email": "dupe@example.com", "password": "password123"},
    )
    response = await client.post(
        "/api/auth/register",
        json={"email": "dupe@example.com", "password": "password123"},
    )
    assert response.status_code == 409


async def test_login_success(client):
    await client.post(
        "/api/auth/register",
        json={"email": "loginuser@example.com", "password": "password123"},
    )
    response = await client.post(
        "/api/auth/login",
        data={"username": "loginuser@example.com", "password": "password123"},
    )
    assert response.status_code == 200
    assert "access_token" in response.json()


async def test_login_wrong_password(client):
    await client.post(
        "/api/auth/register",
        json={"email": "wrongpass@example.com", "password": "password123"},
    )
    response = await client.post(
        "/api/auth/login",
        data={"username": "wrongpass@example.com", "password": "incorrect"},
    )
    assert response.status_code == 401


async def test_get_me(client, auth_headers):
    response = await client.get("/api/auth/me", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["email"] == "testuser@example.com"


async def test_get_me_without_token(client):
    response = await client.get("/api/auth/me")
    assert response.status_code == 401