from uuid import UUID

from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_user, get_program_service
from app.schemas.program import ProgramCreate, ProgramOut, ProgramUpdate
from app.services.program_service import ProgramService

router = APIRouter(prefix="/programs", tags=["programs"])


@router.get("", response_model=list[ProgramOut])
async def get_programs(svc: ProgramService = Depends(get_program_service)):
    return await svc.get_programs()


@router.post("", response_model=ProgramOut, status_code=201)
async def publish_program(
    dto: ProgramCreate,
    svc: ProgramService = Depends(get_program_service),
    current_user=Depends(get_current_user),
):
    return await svc.publish_program(current_user.id, dto)


@router.put("/{id}", response_model=ProgramOut)
async def update_program(
    id: UUID,
    dto: ProgramUpdate,
    svc: ProgramService = Depends(get_program_service),
    current_user=Depends(get_current_user),
):
    return await svc.update_program(id, dto)
