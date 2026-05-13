from uuid import UUID

from pydantic import BaseModel


class StudentProfileCreate(BaseModel):
    full_name: str
    gpa: float
    major: str
    skills: list[str] = []


class StudentProfileUpdate(BaseModel):
    full_name: str | None = None
    gpa: float | None = None
    major: str | None = None
    skills: list[str] | None = None


class StudentProfileOut(BaseModel):
    id: UUID
    full_name: str
    gpa: float | None
    major: str | None
    skills: list[str]
    is_complete: bool

    model_config = {"from_attributes": True}
