from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user, get_position_service
from app.models.enums import UserRole
from app.models.professor import Professor
from app.schemas.position import PositionCreate, PositionOut, PositionStatusUpdate
from app.services.position_service import PositionService

router = APIRouter(prefix="/positions", tags=["positions"])


@router.get("", response_model=list[PositionOut])
async def get_positions(svc: PositionService = Depends(get_position_service)):
    return await svc.get_open_positions()


@router.get("/filter", response_model=list[PositionOut])
async def filter_positions(
    dept: str | None = None,
    gpa: float | None = None,
    svc: PositionService = Depends(get_position_service),
):
    return await svc.filter_positions({"dept": dept, "gpa": gpa})


@router.post("", response_model=PositionOut, status_code=201)
async def create_position(
    dto: PositionCreate,
    svc: PositionService = Depends(get_position_service),
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.role != UserRole.PROFESSOR:
        raise HTTPException(status_code=403, detail="Only professors can create positions")
    result = await db.execute(select(Professor).where(Professor.user_id == current_user.id))
    prof = result.scalar_one_or_none()
    if not prof:
        raise HTTPException(status_code=404, detail="Professor profile not found")
    return await svc.create_position(prof.id, dto)


@router.put("/{id}/status")
async def update_status(
    id: UUID,
    dto: PositionStatusUpdate,
    svc: PositionService = Depends(get_position_service),
    current_user=Depends(get_current_user),
):
    await svc.update_status(id, dto.status)
    return {"detail": "status updated"}
