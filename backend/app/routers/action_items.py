import math
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError
from typing import Optional

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.action_item import ActionItemUpdate, ActionItemResponse, PaginatedActionItems, VALID_STATUSES
from app.schemas.pagination import PaginationMeta
from app.services import action_item_service

router = APIRouter(prefix="/api/action-items", tags=["Action Items"])


@router.get("", response_model=PaginatedActionItems)
async def list_action_items(
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status"),
    owner: Optional[str] = Query(None, description="Filter by owner (partial match)"),
    search: Optional[str] = Query(None, description="Search by task text"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if status_filter is not None and status_filter not in VALID_STATUSES:
        raise HTTPException(
            status_code=422,
            detail=f"Invalid status '{status_filter}'. Must be one of: {', '.join(VALID_STATUSES)}",
        )

    items, total = await action_item_service.get_action_items(
        db,
        user_id=current_user.id,
        page=page,
        limit=limit,
        status_filter=status_filter,
        owner=owner,
        search=search,
    )
    total_pages = math.ceil(total / limit) if total > 0 else 0

    return PaginatedActionItems(
        items=items,
        pagination=PaginationMeta(
            total=total,
            page=page,
            limit=limit,
            total_pages=total_pages,
            has_next=page < total_pages,
            has_prev=page > 1,
        ),
    )


@router.get("/{action_id}", response_model=ActionItemResponse)
async def get_action_item(
    action_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    action_item = await action_item_service.get_action_item_by_id(db, action_id, user_id=current_user.id)
    if action_item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Action item with id {action_id} not found.",
        )
    return action_item


@router.patch("/{action_id}", response_model=ActionItemResponse)
async def update_action_item(
    action_id: int,
    data: ActionItemUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    action_item = await action_item_service.get_action_item_by_id(db, action_id, user_id=current_user.id)
    if action_item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Action item with id {action_id} not found.",
        )
    try:
        return await action_item_service.update_action_item(db, action_item, data)
    except SQLAlchemyError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update action item due to a database error.",
        )


@router.delete("/{action_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_action_item(
    action_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    action_item = await action_item_service.get_action_item_by_id(db, action_id, user_id=current_user.id)
    if action_item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Action item with id {action_id} not found.",
        )
    try:
        await action_item_service.delete_action_item(db, action_item)
    except SQLAlchemyError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete action item due to a database error.",
        )