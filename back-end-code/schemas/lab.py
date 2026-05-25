from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from app.models.enums import LabStatus


class RosterAddRequest(BaseModel):
    student_id: UUID | None = None
    username: str | None = None
    role: str


class LabStatusUpdate(BaseModel):
    status: LabStatus


class LabCreate(BaseModel):
    name: str
    department: str | None = None


class LabUpdate(BaseModel):
    name: str | None = None
    department: str | None = None
    status: LabStatus | None = None


class LabCertificationUpdate(BaseModel):
    cert_type: str | None = None
    cert_expiry: datetime | None = None


class LabOut(BaseModel):
    id: UUID
    name: str
    department: str | None
    status: LabStatus
    cert_type: str | None = None
    cert_expiry: datetime | None

    model_config = {"from_attributes": True}


class LabMemberOut(BaseModel):
    id: UUID
    student_id: UUID
    role: str | None
    joined_at: datetime | None

    model_config = {"from_attributes": True}


class LabMemberDetail(BaseModel):
    id: UUID
    student_id: UUID
    username: str
    full_name: str
    email: str
    role: str | None
    joined_at: datetime | None
