from uuid import UUID

from fastapi import APIRouter, Depends

from app.core.dependencies import (
    get_current_professor,
    get_current_user,
    get_funding_service,
)
from app.models.enums import FundingStatus
from app.schemas.funding import (
    FundingDecision,
    FundingRequestCreate,
    FundingRequestDetailOut,
    FundingRequestOut,
)
from app.services.funding_service import FundingService

router = APIRouter(prefix="/funding", tags=["funding"])


@router.post("/requests", response_model=FundingRequestOut, status_code=201)
async def submit_request(
    dto: FundingRequestCreate,
    svc: FundingService = Depends(get_funding_service),
    professor=Depends(get_current_professor),
):
    return await svc.submit_request(professor.id, dto)


@router.get("/requests/mine", response_model=list[FundingRequestOut])
async def get_my_requests(
    svc: FundingService = Depends(get_funding_service),
    professor=Depends(get_current_professor),
):
    return await svc.get_my_requests(professor.id)


@router.get("/requests", response_model=list[FundingRequestDetailOut])
async def get_requests(
    status: FundingStatus | None = None,
    svc: FundingService = Depends(get_funding_service),
    current_user=Depends(get_current_user),
):
    return await svc.get_all_detail(status)


@router.post("/requests/{id}/decide")
async def record_decision(
    id: UUID,
    dto: FundingDecision,
    svc: FundingService = Depends(get_funding_service),
    current_user=Depends(get_current_user),
):
    await svc.record_decision(id, dto, current_user.id)
    return {"detail": "decision recorded"}
