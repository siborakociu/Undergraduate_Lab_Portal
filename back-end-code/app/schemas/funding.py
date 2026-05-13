from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from app.models.enums import FundingStatus


class FundingRequestCreate(BaseModel):
    amount: float
    purpose: str


class FundingDecision(BaseModel):
    decision: FundingStatus
    notes: str | None = None


class FundingRequestOut(BaseModel):
    id: UUID
    amount: float
    purpose: str | None
    status: FundingStatus
    submitted_at: datetime | None

    model_config = {"from_attributes": True}
