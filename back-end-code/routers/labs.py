from uuid import UUID

from fastapi import APIRouter, Depends

from app.core.dependencies import (
    get_current_professor,
    get_current_user,
    get_lab_service,
    get_position_service,
)
from app.schemas.lab import (
    LabCreate,
    LabMemberDetail,
    LabMemberOut,
    LabOut,
    LabStatusUpdate,
    LabUpdate,
    RosterAddRequest,
)
from app.schemas.position import PositionOut
from app.services.lab_service import LabService
from app.services.position_service import PositionService

router = APIRouter(prefix="/labs", tags=["labs"])


@router.get("/my", response_model=LabOut)
async def get_my_lab(
    svc: LabService = Depends(get_lab_service),
    professor=Depends(get_current_professor),
    current_user=Depends(get_current_user),
):
    return await svc.get_or_create_lab_for_professor(
        professor, default_name=f"{current_user.username}'s Lab"
    )


@router.get("/mine", response_model=list[LabOut])
async def list_my_labs(
    svc: LabService = Depends(get_lab_service),
    professor=Depends(get_current_professor),
):
    return await svc.list_labs_for_professor(professor.id)


@router.post("", response_model=LabOut, status_code=201)
async def create_lab(
    dto: LabCreate,
    svc: LabService = Depends(get_lab_service),
    professor=Depends(get_current_professor),
):
    return await svc.create_lab_for_professor(professor.id, dto)


@router.put("/{id}", response_model=LabOut)
async def update_lab(
    id: UUID,
    dto: LabUpdate,
    svc: LabService = Depends(get_lab_service),
    professor=Depends(get_current_professor),
):
    return await svc.update_lab(id, professor.id, dto)


@router.get("/{id}/positions", response_model=list[PositionOut])
async def get_lab_positions(
    id: UUID,
    svc: PositionService = Depends(get_position_service),
    current_user=Depends(get_current_user),
):
    return await svc.get_positions_for_lab(id)


@router.get("/{id}", response_model=LabOut)
async def get_lab(
    id: UUID,
    svc: LabService = Depends(get_lab_service),
    current_user=Depends(get_current_user),
):
    return await svc.get_compliance(id)


@router.get("/{id}/roster", response_model=list[LabMemberOut])
async def get_roster(
    id: UUID,
    svc: LabService = Depends(get_lab_service),
    current_user=Depends(get_current_user),
):
    return await svc.get_lab_roster(id)


@router.get("/{id}/roster/detail", response_model=list[LabMemberDetail])
async def get_roster_detail(
    id: UUID,
    svc: LabService = Depends(get_lab_service),
    current_user=Depends(get_current_user),
):
    return await svc.get_lab_roster_detail(id)


@router.post("/{id}/roster", response_model=LabMemberOut, status_code=201)
async def add_member(
    id: UUID,
    dto: RosterAddRequest,
    svc: LabService = Depends(get_lab_service),
    current_user=Depends(get_current_user),
):
    return await svc.add_member(id, dto)


@router.delete("/{id}/roster/{mid}")
async def remove_member(
    id: UUID,
    mid: UUID,
    svc: LabService = Depends(get_lab_service),
    current_user=Depends(get_current_user),
):
    await svc.remove_member(mid)
    return {"detail": "member removed"}


@router.put("/{id}/status")
async def update_status(
    id: UUID,
    dto: LabStatusUpdate,
    svc: LabService = Depends(get_lab_service),
    current_user=Depends(get_current_user),
):
    await svc.update_lab_status(id, dto.status)
    return {"detail": "status updated"}
