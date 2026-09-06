from typing import Optional, List
from pydantic import BaseModel, Field


class ActionItemAI(BaseModel):
    task: str = Field(description="A concise, clear description of the action item.")
    owner: Optional[str] = Field(
        default=None,
        description="The person responsible for this task. Null if not explicitly mentioned in the notes.",
    )
    deadline: Optional[str] = Field(
        default=None,
        description="The deadline for this task, as mentioned in the notes. Null if not explicitly mentioned.",
    )


class MeetingAIResponse(BaseModel):
    summary: str = Field(description="A concise summary of the meeting.")
    actions: List[ActionItemAI] = Field(
        default_factory=list,
        description="List of extracted action items from the meeting notes.",
    )