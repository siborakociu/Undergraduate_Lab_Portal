from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException

from app.core.dependencies import get_app_service, get_current_professor, get_current_user
from app.schemas.application import (
    ApplicantOut,
    ApplicationCreate,
    ApplicationOut,
    ApplicationStatusUpdate,
)
from app.services.application_service import ApplicationService

router = APIRouter(prefix="/applications", tags=["applications"])


@router.post("", response_model=ApplicationOut, status_code=201)
async def create_application(
    dto: ApplicationCreate,
    svc: ApplicationService = Depends(get_app_service),
    current_user=Depends(get_current_user),
):
    return await svc.create_application(current_user.id, dto)


@router.get("/me", response_model=list[ApplicationOut])
async def get_my_applications(
    svc: ApplicationService = Depends(get_app_service),
    current_user=Depends(get_current_user),
):
    return await svc.get_applications_by_user(current_user.id)


@router.get("/for-professor", response_model=list[ApplicantOut])
async def get_applicants_for_professor(
    svc: ApplicationService = Depends(get_app_service),
    professor=Depends(get_current_professor),
):
    return await svc.get_applicants_for_professor(professor.id)


@router.get("/{id}/applicant", response_model=ApplicantOut)
async def get_applicant(
    id: UUID,
    svc: ApplicationService = Depends(get_app_service),
    professor=Depends(get_current_professor),
):
    detail = await svc.get_applicant(id)
    if not detail:
        raise HTTPException(status_code=404, detail="Application not found")
    return detail


@router.get("/position/{id}", response_model=list[ApplicationOut])
async def get_by_position(
    id: UUID,
    svc: ApplicationService = Depends(get_app_service),
    current_user=Depends(get_current_user),
):
    return await svc.get_by_position(id)


@router.put("/{id}/status")
async def update_status(
    id: UUID,
    dto: ApplicationStatusUpdate,
    svc: ApplicationService = Depends(get_app_service),
    current_user=Depends(get_current_user),
):
    await svc.update_status(id, dto)
    return {"detail": "status updated"}
