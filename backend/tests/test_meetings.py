import pytest
from unittest.mock import AsyncMock, patch

from app.schemas.ai import MeetingAIResponse, ActionItemAI


def mock_ai_response():
    return MeetingAIResponse(
        summary="Discussion about ACC integration readiness.",
        actions=[
            ActionItemAI(task="Review ACC integration", owner="Amjad", deadline=None),
            ActionItemAI(task="Prepare deployment scripts", owner="Ali", deadline=None),
        ],
    )


@pytest.fixture
def mock_ai():
    with patch(
        "app.services.meeting_service.process_meeting_notes",
        new=AsyncMock(return_value=mock_ai_response()),
    ) as mocked:
        yield mocked


async def test_create_meeting(client, mock_ai, auth_headers):
    payload = {
        "title": "Claims Team Meeting",
        "notes": "Meeting with Claims team. Amjad will review ACC integration. Ali will prepare deployment scripts.",
    }
    response = await client.post("/api/meetings", json=payload, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Claims Team Meeting"
    assert data["summary"] == "Discussion about ACC integration readiness."
    assert len(data["action_items"]) == 2
    assert data["action_items"][0]["owner"] == "Amjad"
    mock_ai.assert_awaited_once()


async def test_create_meeting_requires_auth(client, mock_ai):
    # Yeh test check karta hai ke bina token ke 401 Unauthorized error aaye
    payload = {"title": "No Auth Meeting", "notes": "Some notes here"}
    response = await client.post("/api/meetings", json=payload)
    assert response.status_code == 401


async def test_get_meetings(client, mock_ai, auth_headers):
    await client.post(
        "/api/meetings",
        json={"title": "Meeting A", "notes": "Some notes"},
        headers=auth_headers,
    )
    response = await client.get("/api/meetings", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "pagination" in data
    assert len(data["items"]) == 1
    assert data["pagination"]["total"] == 1


async def test_get_meeting_by_id(client, mock_ai, auth_headers):
    create_res = await client.post(
        "/api/meetings",
        json={"title": "Meeting B", "notes": "Notes here"},
        headers=auth_headers,
    )
    meeting_id = create_res.json()["id"]

    response = await client.get(f"/api/meetings/{meeting_id}", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["id"] == meeting_id


async def test_get_meeting_invalid_id(client, auth_headers):
    response = await client.get("/api/meetings/99999", headers=auth_headers)
    assert response.status_code == 404


async def test_update_meeting(client, mock_ai, auth_headers):
    create_res = await client.post(
        "/api/meetings",
        json={"title": "Old Title", "notes": "Notes"},
        headers=auth_headers,
    )
    meeting_id = create_res.json()["id"]

    response = await client.patch(
        f"/api/meetings/{meeting_id}",
        json={"title": "New Title"},
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert response.json()["title"] == "New Title"


async def test_delete_meeting(client, mock_ai, auth_headers):
    create_res = await client.post(
        "/api/meetings",
        json={"title": "To Delete", "notes": "Notes"},
        headers=auth_headers,
    )
    meeting_id = create_res.json()["id"]

    response = await client.delete(f"/api/meetings/{meeting_id}", headers=auth_headers)
    assert response.status_code == 204

    get_res = await client.get(f"/api/meetings/{meeting_id}", headers=auth_headers)
    assert get_res.status_code == 404


async def test_ai_response_validation(client):
    """AI service ka structured output validate hota hai (Pydantic schema)."""
    valid = MeetingAIResponse(summary="Test summary", actions=[])
    assert valid.summary == "Test summary"
    assert valid.actions == []

    action = ActionItemAI(task="Do something", owner=None, deadline=None)
    assert action.owner is None
    assert action.deadline is None
