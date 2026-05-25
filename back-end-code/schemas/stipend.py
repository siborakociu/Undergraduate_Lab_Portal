from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from app.models.enums import StipendStatus


class StipendCreate(BaseModel):
    student_id: UUID
    amount: float


class StipendDecision(BaseModel):
    status: StipendStatus


class StipendOut(BaseModel):
    id: UUID
    student_id: UUID | None
    amount: float
    status: StipendStatus
    processed_at: datetime | None

    model_config = {"from_attributes": True}


class StipendDetailOut(BaseModel):
    id: UUID
    amount: float
    purpose: str | None
    status: StipendStatus
    submitted_at: datetime | None
    processed_at: datetime | None
    position_id: UUID | None
    position_title: str | None
    lab_id: UUID | None
    lab_name: str | None
    lab_department: str | None
    professor_id: UUID | None
    professor_username: str | None
    professor_email: str | None
