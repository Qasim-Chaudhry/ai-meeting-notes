import pytest
from unittest.mock import AsyncMock, patch

from app.schemas.ai import MeetingAIResponse, ActionItemAI


def mock_ai_response():
    return MeetingAIResponse(
        summary="Test summary",
        actions=[ActionItemAI(task="Initial task", owner="Sara", deadline=None)],
    )


@pytest.fixture
def mock_ai():
    with patch(
        "app.services.meeting_service.process_meeting_notes",
        new=AsyncMock(return_value=mock_ai_response()),
    ):
        yield


async def _create_meeting_with_action_item(client, auth_headers):
    res = await client.post(
        "/api/meetings",
        json={"title": "Meeting", "notes": "Notes"},
        headers=auth_headers,
    )
    meeting = res.json()
    return meeting["action_items"][0]["id"]


async def test_update_action_item(client, mock_ai, auth_headers):
    action_id = await _create_meeting_with_action_item(client, auth_headers)

    response = await client.patch(
        f"/api/action-items/{action_id}",
        json={"task": "Updated task", "owner": "Bilal"},
        headers=auth_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["task"] == "Updated task"
    assert data["owner"] == "Bilal"


async def test_complete_action_item(client, mock_ai, auth_headers):
    action_id = await _create_meeting_with_action_item(client, auth_headers)

    response = await client.patch(
        f"/api/action-items/{action_id}",
        json={"status": "completed"},
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert response.json()["status"] == "completed"


async def test_invalid_action_item_id(client, auth_headers):
    response = await client.get("/api/action-items/99999", headers=auth_headers)
    assert response.status_code == 404


async def test_invalid_status_value(client, mock_ai, auth_headers):
    action_id = await _create_meeting_with_action_item(client, auth_headers)

    response = await client.patch(
        f"/api/action-items/{action_id}",
        json={"status": "not_a_real_status"},
        headers=auth_headers,
    )
    assert response.status_code == 422


async def test_list_action_items_requires_auth(client):
    response = await client.get("/api/action-items")
    assert response.status_code == 401