from uuid import UUID

from pydantic import BaseModel


class ProfessorOut(BaseModel):
    id: UUID
    user_id: UUID
    username: str
    email: str
    department: str | None
    title: str | None


class ProfessorUpdate(BaseModel):
    department: str | None = None
    title: str | None = None
