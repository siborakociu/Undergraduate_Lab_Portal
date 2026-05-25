from uuid import UUID

from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_professor, get_current_user, get_position_service
from app.schemas.position import PositionCreate, PositionOut, PositionStatusUpdate
from app.services.position_service import PositionService

router = APIRouter(prefix="/positions", tags=["positions"])


@router.get("", response_model=list[PositionOut])
async def get_positions(svc: PositionService = Depends(get_position_service)):
    return await svc.get_open_positions()


@router.get("/mine", response_model=list[PositionOut])
async def get_my_positions(
    svc: PositionService = Depends(get_position_service),
    professor=Depends(get_current_professor),
):
    return await svc.get_positions_for_professor(professor.id)


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
    professor=Depends(get_current_professor),
):
    return await svc.create_position(professor.id, dto)


@router.put("/{id}/status")
async def update_status(
    id: UUID,
    dto: PositionStatusUpdate,
    svc: PositionService = Depends(get_position_service),
    current_user=Depends(get_current_user),
):
    await svc.update_status(id, dto.status)
    return {"detail": "status updated"}
