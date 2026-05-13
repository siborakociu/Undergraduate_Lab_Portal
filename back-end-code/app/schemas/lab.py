from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from app.models.enums import LabStatus


class RosterAddRequest(BaseModel):
    student_id: UUID
    role: str


class LabStatusUpdate(BaseModel):
    status: LabStatus


class LabOut(BaseModel):
    id: UUID
    name: str
    department: str | None
    status: LabStatus
    cert_expiry: datetime | None

    model_config = {"from_attributes": True}


class LabMemberOut(BaseModel):
    id: UUID
    student_id: UUID
    role: str | None
    joined_at: datetime | None

    model_config = {"from_attributes": True}
