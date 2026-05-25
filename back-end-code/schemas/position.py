from uuid import UUID

from pydantic import BaseModel

from app.models.enums import PositionStatus


class PositionCreate(BaseModel):
    title: str
    description: str
    required_gpa: float
    department: str
    lab_id: UUID
    stipend_per_student: float
    max_students: int


class PositionStatusUpdate(BaseModel):
    status: PositionStatus


class PositionOut(BaseModel):
    id: UUID
    title: str
    description: str | None
    status: PositionStatus
    required_gpa: float | None
    department: str | None
    lab_id: UUID | None = None
    stipend_per_student: float | None = None
    max_students: int | None = None

    model_config = {"from_attributes": True}


class PositionWithLabOut(PositionOut):
    lab_name: str | None = None
