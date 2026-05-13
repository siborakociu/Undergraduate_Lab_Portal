from uuid import UUID

from pydantic import BaseModel

from app.models.enums import PositionStatus


class PositionCreate(BaseModel):
    title: str
    description: str
    required_gpa: float
    department: str


class PositionStatusUpdate(BaseModel):
    status: PositionStatus


class PositionOut(BaseModel):
    id: UUID
    title: str
    description: str | None
    status: PositionStatus
    required_gpa: float | None
    department: str | None

    model_config = {"from_attributes": True}
