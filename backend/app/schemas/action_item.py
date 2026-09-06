from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel, ConfigDict, field_validator
from app.schemas.pagination import PaginatedResponse

# 1. Allowed statuses define karein
VALID_STATUSES = {"pending", "in_progress", "completed"}


# 2. Update Request Schema (Saari fields optional hain taake partial updates ho sakein)
class ActionItemUpdate(BaseModel):
    task: Optional[str] = None
    owner: Optional[str] = None
    deadline: Optional[date] = None
    status: Optional[str] = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: Optional[str]) -> Optional[str]:
        if value is not None and value not in VALID_STATUSES:
            raise ValueError(
                f"Invalid status '{value}'. Must be one of: {', '.join(VALID_STATUSES)}"
            )
        return value


# 3. Response Schema (Database se data client ko bhejne ke liye)
class ActionItemResponse(BaseModel):
    id: int
    meeting_id: int
    task: str
    owner: Optional[str] = None
    deadline: Optional[date] = None
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

# 4. Paginated Response Schema
class PaginatedActionItems(PaginatedResponse[ActionItemResponse]):
    pass