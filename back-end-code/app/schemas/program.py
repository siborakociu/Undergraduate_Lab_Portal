from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from app.models.enums import ProgramStatus


class ProgramCreate(BaseModel):
    title: str
    country: str
    deadline: datetime


class ProgramUpdate(BaseModel):
    title: str | None = None
    country: str | None = None
    deadline: datetime | None = None
    status: ProgramStatus | None = None


class ProgramOut(BaseModel):
    id: UUID
    title: str
    country: str | None
    deadline: datetime | None
    status: ProgramStatus

    model_config = {"from_attributes": True}
