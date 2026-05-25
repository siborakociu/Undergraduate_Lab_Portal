from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_log import AuditLog


class AuditRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, log: AuditLog) -> AuditLog:
        self.db.add(log)
        await self.db.commit()
        await self.db.refresh(log)
        return log

    async def get_by_entity(self, entity_id: UUID) -> list[AuditLog]:
        result = await self.db.execute(
            select(AuditLog).where(AuditLog.entity_id == entity_id)
        )
        return list(result.scalars().all())

    async def get_all(self) -> list[AuditLog]:
        result = await self.db.execute(select(AuditLog))
        return list(result.scalars().all())
