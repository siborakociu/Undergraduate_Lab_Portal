from uuid import UUID

from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_user, get_funding_service
from app.schemas.funding import FundingDecision, FundingRequestOut
from app.services.funding_service import FundingService

router = APIRouter(prefix="/funding", tags=["funding"])


@router.get("/requests", response_model=list[FundingRequestOut])
async def get_requests(
    svc: FundingService = Depends(get_funding_service),
    current_user=Depends(get_current_user),
):
    return await svc.get_pending_requests()


@router.post("/requests/{id}/decide")
async def record_decision(
    id: UUID,
    dto: FundingDecision,
    svc: FundingService = Depends(get_funding_service),
    current_user=Depends(get_current_user),
):
    await svc.record_decision(id, dto, current_user.id)
    return {"detail": "decision recorded"}
