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
    student_id: UUID
    amount: float
    status: StipendStatus
    processed_at: datetime | None

    model_config = {"from_attributes": True}
