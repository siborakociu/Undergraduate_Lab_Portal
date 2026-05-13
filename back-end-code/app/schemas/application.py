from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from app.models.enums import ApplicationStatus


class ApplicationCreate(BaseModel):
    student_id: UUID
    position_id: UUID
    program_id: UUID | None = None


class ApplicationStatusUpdate(BaseModel):
    status: ApplicationStatus
    decision_notes: str | None = None


class ApplicationOut(BaseModel):
    id: UUID
    student_id: UUID
    position_id: UUID
    status: ApplicationStatus
    submitted_at: datetime
    decision_at: datetime | None

    model_config = {"from_attributes": True}
