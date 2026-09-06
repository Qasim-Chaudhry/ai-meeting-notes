from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from typing import Optional, Tuple, List

from app.models.meeting import Meeting
from app.models.action_item import ActionItem


async def get_action_items(
    db: AsyncSession,
    user_id: int,
    page: int = 1,
    limit: int = 20,
    status_filter: Optional[str] = None,
    owner: Optional[str] = None,
    search: Optional[str] = None,
) -> Tuple[List, int]:
    base_stmt = select(ActionItem).join(Meeting).where(Meeting.user_id == user_id)

    if status_filter:
        base_stmt = base_stmt.where(ActionItem.status == status_filter)
    if owner:
        base_stmt = base_stmt.where(ActionItem.owner.ilike(f"%{owner}%"))
    if search:
        base_stmt = base_stmt.where(ActionItem.task.ilike(f"%{search}%"))

    count_stmt = select(func.count()).select_from(base_stmt.subquery())
    total_result = await db.execute(count_stmt)
    total = total_result.scalar_one()

    offset = (page - 1) * limit
    items_stmt = base_stmt.order_by(ActionItem.id.desc()).offset(offset).limit(limit)
    items_result = await db.execute(items_stmt)
    items = list(items_result.scalars().all())

    return items, total


async def get_action_item_by_id(db: AsyncSession, action_id: int, user_id: int) -> Optional[object]:
    stmt = select(ActionItem).join(Meeting).where(ActionItem.id == action_id, Meeting.user_id == user_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def update_action_item(db: AsyncSession, action_item, data) -> object:
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(action_item, field, value)

    db.add(action_item)
    await db.commit()
    await db.refresh(action_item)
    return action_item


async def delete_action_item(db: AsyncSession, action_item) -> None:
    await db.delete(action_item)
    await db.commit()