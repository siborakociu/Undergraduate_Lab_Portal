from uuid import UUID

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user, get_document_service
from app.repositories.student_repository import StudentRepository
from app.schemas.shared import DocumentOut
from app.services.document_service import DocumentService

router = APIRouter(prefix="/documents", tags=["documents"])


@router.post("", response_model=DocumentOut, status_code=201)
async def upload_document(
    file: UploadFile = File(...),
    svc: DocumentService = Depends(get_document_service),
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    repo = StudentRepository(db)
    profile = await repo.get_by_user_id(current_user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found")
    return await svc.upload_document(file, profile.id)


@router.get("/student/{student_id}", response_model=list[DocumentOut])
async def get_documents(
    student_id: UUID,
    svc: DocumentService = Depends(get_document_service),
    current_user=Depends(get_current_user),
):
    return await svc.get_documents(student_id)


@router.delete("/{id}")
async def delete_document(
    id: UUID,
    svc: DocumentService = Depends(get_document_service),
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    repo = StudentRepository(db)
    profile = await repo.get_by_user_id(current_user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found")
    await svc.delete_document(id, profile.id)
    return {"detail": "document deleted"}
