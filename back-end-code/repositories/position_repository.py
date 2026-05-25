from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.enums import PositionStatus
from app.models.position import Position


class PositionRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_open(self) -> list[Position]:
        result = await self.db.execute(
            select(Position).where(Position.status == PositionStatus.OPEN)
        )
        return list(result.scalars().all())

    async def get_all(self) -> list[Position]:
        result = await self.db.execute(select(Position))
        return list(result.scalars().all())

    async def get_by_professor(self, professor_id: UUID) -> list[Position]:
        result = await self.db.execute(
            select(Position)
            .where(Position.professor_id == professor_id)
            .order_by(Position.created_at.desc().nullslast(), Position.id.desc())
        )
        return list(result.scalars().all())

    async def get_by_lab(self, lab_id: UUID) -> list[Position]:
        result = await self.db.execute(
            select(Position)
            .where(Position.lab_id == lab_id)
            .order_by(Position.created_at.desc().nullslast(), Position.id.desc())
        )
        return list(result.scalars().all())

    async def get_by_id(self, id: UUID) -> Position | None:
        result = await self.db.execute(select(Position).where(Position.id == id))
        return result.scalar_one_or_none()

    async def create(self, position: Position) -> Position:
        self.db.add(position)
        await self.db.commit()
        await self.db.refresh(position)
        return position

    async def update_status(self, id: UUID, status: PositionStatus) -> None:
        position = await self.get_by_id(id)
        if position:
            position.status = status
            await self.db.commit()
