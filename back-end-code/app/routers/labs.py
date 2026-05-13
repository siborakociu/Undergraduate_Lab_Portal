from uuid import UUID

from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_user, get_lab_service
from app.schemas.lab import LabMemberOut, LabOut, LabStatusUpdate, RosterAddRequest
from app.services.lab_service import LabService

router = APIRouter(prefix="/labs", tags=["labs"])


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
