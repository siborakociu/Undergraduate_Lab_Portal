from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.enums import StipendStatus
from app.models.lab import Lab
from app.models.position import Position
from app.models.professor import Professor
from app.models.stipend import Stipend
from app.models.user import User


class StipendRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_pending(self) -> list[Stipend]:
        result = await self.db.execute(
            select(Stipend).where(Stipend.status == StipendStatus.PENDING)
        )
        return list(result.scalars().all())

    async def get_by_student(self, student_id: UUID) -> list[Stipend]:
        result = await self.db.execute(
            select(Stipend).where(Stipend.student_id == student_id)
        )
        return list(result.scalars().all())

    async def get_by_id(self, id: UUID) -> Stipend | None:
        result = await self.db.execute(select(Stipend).where(Stipend.id == id))
        return result.scalar_one_or_none()

    async def get_all_detail(self, status: StipendStatus | None = None) -> list[dict]:
        stmt = (
            select(
                Stipend.id,
                Stipend.amount,
                Stipend.purpose,
                Stipend.status,
                Stipend.submitted_at,
                Stipend.processed_at,
                Stipend.position_id,
                Position.title,
                Stipend.lab_id,
                Lab.name,
                Lab.department,
                Position.professor_id,
                User.username,
                User.email,
            )
            .outerjoin(Position, Stipend.position_id == Position.id)
            .outerjoin(Lab, Stipend.lab_id == Lab.id)
            .outerjoin(Professor, Position.professor_id == Professor.id)
            .outerjoin(User, Professor.user_id == User.id)
            .order_by(Stipend.submitted_at.desc().nullslast())
        )
        if status is not None:
            stmt = stmt.where(Stipend.status == status)
        result = await self.db.execute(stmt)
        return [
            {
                "id": r[0],
                "amount": float(r[1]) if r[1] is not None else 0.0,
                "purpose": r[2],
                "status": r[3],
                "submitted_at": r[4],
                "processed_at": r[5],
                "position_id": r[6],
                "position_title": r[7],
                "lab_id": r[8],
                "lab_name": r[9],
                "lab_department": r[10],
                "professor_id": r[11],
                "professor_username": r[12],
                "professor_email": r[13],
            }
            for r in result.all()
        ]

    async def create(self, stipend: Stipend) -> Stipend:
        self.db.add(stipend)
        await self.db.commit()
        await self.db.refresh(stipend)
        return stipend

    async def update_status(self, id: UUID, status: StipendStatus) -> None:
        stipend = await self.get_by_id(id)
        if stipend:
            from datetime import datetime
            stipend.status = status
            if status == StipendStatus.PROCESSED:
                stipend.processed_at = datetime.utcnow()
            await self.db.commit()
