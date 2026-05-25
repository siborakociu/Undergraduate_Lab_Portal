from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from app.models.enums import ApplicationStatus


class ApplicationCreate(BaseModel):
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


class ApplicantOut(BaseModel):
    application_id: UUID
    position_id: UUID
    position_title: str
    student_profile_id: UUID
    username: str
    email: str
    full_name: str
    gpa: float | None
    major: str | None
    skills: list[str]
    status: ApplicationStatus
    submitted_at: datetime
    decision_at: datetime | None
    decision_notes: str | None
