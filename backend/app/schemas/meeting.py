from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from app.schemas.pagination import PaginatedResponse
from app.schemas.action_item import ActionItemResponse


class MeetingCreate(BaseModel):
    title: str
    notes: Optional[str] = None


class MeetingUpdate(BaseModel):
    title: Optional[str] = None
    notes: Optional[str] = None


class MeetingResponse(BaseModel):
    id: int
    title: str
    notes: Optional[str] = None
    summary: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    action_items: List[ActionItemResponse] = []

    model_config = ConfigDict(from_attributes=True)

class PaginatedMeetings(PaginatedResponse[MeetingResponse]):
    pass