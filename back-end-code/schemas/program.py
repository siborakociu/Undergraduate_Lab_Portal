from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from app.models.enums import ApplicationStatus, ProgramStatus


class ProgramCreate(BaseModel):
    title: str
    country: str | None = None
    deadline: datetime | None = None
    description: str | None = None
    required_gpa: float | None = None


class ProgramUpdate(BaseModel):
    title: str | None = None
    country: str | None = None
    deadline: datetime | None = None
    description: str | None = None
    required_gpa: float | None = None
    status: ProgramStatus | None = None


class ProgramOut(BaseModel):
    id: UUID
    title: str
    country: str | None
    deadline: datetime | None
    description: str | None
    required_gpa: float | None
    status: ProgramStatus

    model_config = {"from_attributes": True}


class ProgramApplicationCreate(BaseModel):
    program_id: UUID


class ProgramApplicationStatusUpdate(BaseModel):
    status: ApplicationStatus
    decision_notes: str | None = None


class ProgramApplicationOut(BaseModel):
    id: UUID
    student_id: UUID
    program_id: UUID
    status: ApplicationStatus
    submitted_at: datetime
    decision_at: datetime | None

    model_config = {"from_attributes": True}


class ProgramApplicantOut(BaseModel):
    application_id: UUID
    program_id: UUID
    program_title: str
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


class StudentProgramApplicationOut(BaseModel):
    id: UUID
    program_id: UUID
    program_title: str
    program_country: str | None
    status: ApplicationStatus
    submitted_at: datetime
    decision_at: datetime | None
    decision_notes: str | None
