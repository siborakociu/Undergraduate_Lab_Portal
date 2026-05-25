from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from app.models.enums import FundingStatus


class FundingRequestCreate(BaseModel):
    lab_id: UUID
    amount: float
    purpose: str


class FundingDecision(BaseModel):
    decision: FundingStatus
    notes: str | None = None


class FundingRequestOut(BaseModel):
    id: UUID
    lab_id: UUID | None
    amount: float
    purpose: str | None
    status: FundingStatus
    submitted_at: datetime | None
    reviewed_at: datetime | None = None

    model_config = {"from_attributes": True}


class FundingRequestDetailOut(BaseModel):
    id: UUID
    amount: float
    purpose: str | None
    status: FundingStatus
    submitted_at: datetime | None
    reviewed_at: datetime | None
    professor_id: UUID
    professor_username: str
    professor_email: str
    lab_id: UUID | None
    lab_name: str | None
    lab_department: str | None
