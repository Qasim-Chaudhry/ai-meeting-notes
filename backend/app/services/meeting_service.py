from typing import Optional
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status
from datetime import datetime

from app.models.meeting import Meeting
from app.models.action_item import ActionItem
from app.schemas.meeting import MeetingCreate, MeetingUpdate
from app.services.ai_service import process_meeting_notes

# ==========================================
# 1. UTILITY FUNCTIONS
# ==========================================
def _parse_deadline(deadline_str: str):
    if not deadline_str:
        return None
    from datetime import datetime
    try:
        return datetime.strptime(deadline_str, "%Y-%m-%d").date()
    except ValueError:
        return None

# ==========================================
# 2. CORE CRUD FUNCTIONS
# ==========================================
async def create_meeting(db: AsyncSession, data: MeetingCreate, user_id: int) -> Meeting:
    ai_result = await process_meeting_notes(data.notes or "")

    try:
        meeting = Meeting(
            user_id=user_id,
            title=data.title,
            notes=data.notes,
            summary=ai_result.summary,
        )
        db.add(meeting)
        await db.flush()

        for action in ai_result.actions:
            action_item = ActionItem(
                meeting_id=meeting.id,
                task=action.task,
                owner=action.owner,
                deadline=_parse_deadline(action.deadline),
            )
            db.add(action_item)

        await db.commit()
        await db.refresh(meeting, attribute_names=["action_items"])
        return meeting

    except Exception:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save meeting and action items due to a database error.",
        )

async def get_meetings(
    db: AsyncSession,
    user_id: int,  # Added user_id parameter
    page: int = 1,
    limit: int = 20,
    search: Optional[str] = None,
) -> tuple[list[Meeting], int]:
    skip = (page - 1) * limit
    
    # Strictly filter meetings by the logged-in user
    filters = [Meeting.user_id == user_id]
    if search:
        filters.append(Meeting.title.ilike(f"%{search}%"))

    total_stmt = select(func.count()).select_from(Meeting).where(*filters)
    total = (await db.execute(total_stmt)).scalar_one()

    stmt = (
        select(Meeting)
        .where(*filters)
        .order_by(Meeting.created_at.desc())
        .offset(skip)
        .limit(limit)
    )

    result = await db.execute(stmt)
    meetings = result.scalars().all()
    return meetings, total

async def get_meeting_by_id(db: AsyncSession, meeting_id: int, user_id: int) -> Optional[Meeting]:
    result = await db.execute(
        select(Meeting)
        .options(selectinload(Meeting.action_items))
        .where(Meeting.id == meeting_id, Meeting.user_id == user_id)  # Added user_id security check
    )
    return result.scalar_one_or_none()

async def update_meeting(db: AsyncSession, meeting: Meeting, data: MeetingUpdate) -> Meeting:
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(meeting, field, value)

    await db.commit()
    await db.refresh(meeting)
    return meeting

async def delete_meeting(db: AsyncSession, meeting: Meeting) -> None:
    await db.delete(meeting)
    await db.commit()
