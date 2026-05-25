from uuid import UUID

from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_user, get_stipend_service
from app.models.enums import StipendStatus
from app.schemas.stipend import StipendDecision, StipendDetailOut
from app.services.stipend_service import StipendService

router = APIRouter(prefix="/stipends", tags=["stipends"])


@router.get("/pending", response_model=list[StipendDetailOut])
async def get_pending(
    svc: StipendService = Depends(get_stipend_service),
    current_user=Depends(get_current_user),
):
    return await svc.get_pending_stipends()


@router.get("", response_model=list[StipendDetailOut])
async def get_all(
    status: StipendStatus | None = None,
    svc: StipendService = Depends(get_stipend_service),
    current_user=Depends(get_current_user),
):
    return await svc.get_all_detail(status)


@router.post("/{id}/process")
async def process_stipend(
    id: UUID,
    dto: StipendDecision,
    svc: StipendService = Depends(get_stipend_service),
    current_user=Depends(get_current_user),
):
    await svc.process_stipend(id, dto)
    return {"detail": "stipend processed"}
