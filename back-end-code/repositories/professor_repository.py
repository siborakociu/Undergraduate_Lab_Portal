from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.professor import Professor


class ProfessorRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, id: UUID) -> Professor | None:
        result = await self.db.execute(select(Professor).where(Professor.id == id))
        return result.scalar_one_or_none()

    async def get_by_user_id(self, user_id: UUID) -> Professor | None:
        result = await self.db.execute(
            select(Professor).where(Professor.user_id == user_id)
        )
        return result.scalar_one_or_none()

    async def create(self, professor: Professor) -> Professor:
        self.db.add(professor)
        await self.db.commit()
        await self.db.refresh(professor)
        return professor

    async def update(self, professor: Professor) -> Professor:
        await self.db.commit()
        await self.db.refresh(professor)
        return professor

    async def get_or_create(self, user_id: UUID) -> Professor:
        existing = await self.get_by_user_id(user_id)
        if existing:
            return existing
        return await self.create(Professor(user_id=user_id))
