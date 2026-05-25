from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.enums import UserRole
from app.repositories.professor_repository import ProfessorRepository
from app.repositories.user_repository import UserRepository
from app.schemas.professor import ProfessorOut, ProfessorUpdate
from app.services.professor_service import ProfessorService

router = APIRouter(prefix="/professors", tags=["professors"])


def get_professor_service(db: AsyncSession = Depends(get_db)) -> ProfessorService:
    return ProfessorService(ProfessorRepository(db), UserRepository(db))


@router.get("/me", response_model=ProfessorOut)
async def get_me(
    svc: ProfessorService = Depends(get_professor_service),
    current_user=Depends(get_current_user),
):
    if current_user.role != UserRole.PROFESSOR:
        raise HTTPException(status_code=403, detail="Professors only")
    return await svc.get_me(current_user.id)


@router.put("/me", response_model=ProfessorOut)
async def update_me(
    dto: ProfessorUpdate,
    svc: ProfessorService = Depends(get_professor_service),
    current_user=Depends(get_current_user),
):
    if current_user.role != UserRole.PROFESSOR:
        raise HTTPException(status_code=403, detail="Professors only")
    return await svc.update_me(current_user.id, dto)
