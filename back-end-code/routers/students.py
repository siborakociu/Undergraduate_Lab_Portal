from uuid import UUID

from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_user, get_student_service
from app.schemas.student import StudentProfileCreate, StudentProfileOut, StudentProfileUpdate
from app.services.student_service import StudentService

router = APIRouter(prefix="/students", tags=["students"])


@router.get("/{id}/profile", response_model=StudentProfileOut)
async def get_profile(
    id: UUID,
    svc: StudentService = Depends(get_student_service),
    current_user=Depends(get_current_user),
):
    return await svc.get_profile(id)


@router.post("/profile", response_model=StudentProfileOut, status_code=201)
async def create_profile(
    dto: StudentProfileCreate,
    svc: StudentService = Depends(get_student_service),
    current_user=Depends(get_current_user),
):
    return await svc.create_profile(current_user.id, dto)


@router.put("/{id}/profile", response_model=StudentProfileOut)
async def update_profile(
    id: UUID,
    dto: StudentProfileUpdate,
    svc: StudentService = Depends(get_student_service),
    current_user=Depends(get_current_user),
):
    return await svc.update_profile(id, dto)
