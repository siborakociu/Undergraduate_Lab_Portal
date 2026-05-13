from uuid import UUID

from fastapi import APIRouter, Depends

from app.core.dependencies import get_app_service, get_current_user
from app.schemas.application import ApplicationCreate, ApplicationOut, ApplicationStatusUpdate
from app.services.application_service import ApplicationService

router = APIRouter(prefix="/applications", tags=["applications"])


@router.post("", response_model=ApplicationOut, status_code=201)
async def create_application(
    dto: ApplicationCreate,
    svc: ApplicationService = Depends(get_app_service),
    current_user=Depends(get_current_user),
):
    return await svc.create_application(dto)


@router.get("/student/{id}", response_model=list[ApplicationOut])
async def get_by_student(
    id: UUID,
    svc: ApplicationService = Depends(get_app_service),
    current_user=Depends(get_current_user),
):
    return await svc.get_applications(id)


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
