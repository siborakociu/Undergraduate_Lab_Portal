from uuid import UUID

from fastapi import APIRouter, Depends

from app.core.dependencies import (
    get_current_hr_staff,
    get_current_user,
    get_program_service,
)
from app.schemas.program import (
    ProgramApplicantOut,
    ProgramApplicationStatusUpdate,
    ProgramCreate,
    ProgramOut,
    ProgramUpdate,
    StudentProgramApplicationOut,
)
from app.services.program_service import ProgramService

router = APIRouter(prefix="/programs", tags=["programs"])


@router.get("", response_model=list[ProgramOut])
async def get_programs(svc: ProgramService = Depends(get_program_service)):
    return await svc.get_programs()


@router.get("/mine", response_model=list[ProgramOut])
async def get_my_programs(
    svc: ProgramService = Depends(get_program_service),
    hr_staff=Depends(get_current_hr_staff),
):
    return await svc.get_my_programs(hr_staff.id)


@router.post("", response_model=ProgramOut, status_code=201)
async def publish_program(
    dto: ProgramCreate,
    svc: ProgramService = Depends(get_program_service),
    hr_staff=Depends(get_current_hr_staff),
):
    return await svc.publish_program(hr_staff.id, dto)


@router.put("/{id}", response_model=ProgramOut)
async def update_program(
    id: UUID,
    dto: ProgramUpdate,
    svc: ProgramService = Depends(get_program_service),
    hr_staff=Depends(get_current_hr_staff),
):
    return await svc.update_program(id, hr_staff.id, dto)


@router.post("/{id}/apply", status_code=201)
async def apply_to_program(
    id: UUID,
    svc: ProgramService = Depends(get_program_service),
    current_user=Depends(get_current_user),
):
    app = await svc.apply_to_program(current_user.id, id)
    return {"id": str(app.id), "status": app.status.value}


@router.get("/me/applications", response_model=list[StudentProgramApplicationOut])
async def get_my_applications(
    svc: ProgramService = Depends(get_program_service),
    current_user=Depends(get_current_user),
):
    return await svc.get_my_applications(current_user.id)


@router.get("/applicants", response_model=list[ProgramApplicantOut])
async def get_all_applicants(
    svc: ProgramService = Depends(get_program_service),
    hr_staff=Depends(get_current_hr_staff),
):
    return await svc.get_all_applicants_for_hr(hr_staff.id)


@router.get("/{id}/applicants", response_model=list[ProgramApplicantOut])
async def get_applicants_for_program(
    id: UUID,
    svc: ProgramService = Depends(get_program_service),
    hr_staff=Depends(get_current_hr_staff),
):
    return await svc.get_applicants_for_program(id, hr_staff.id)


@router.put("/applications/{id}/status")
async def update_application_status(
    id: UUID,
    dto: ProgramApplicationStatusUpdate,
    svc: ProgramService = Depends(get_program_service),
    hr_staff=Depends(get_current_hr_staff),
):
    await svc.update_application_status(id, hr_staff.id, dto)
    return {"detail": "status updated"}
