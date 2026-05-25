from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.enums import FundingStatus
from app.models.funding_request import FundingRequest
from app.models.lab import Lab
from app.models.professor import Professor
from app.models.user import User


class FundingRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_pending(self) -> list[FundingRequest]:
        result = await self.db.execute(
            select(FundingRequest).where(FundingRequest.status == FundingStatus.PENDING)
        )
        return list(result.scalars().all())

    async def get_by_id(self, id: UUID) -> FundingRequest | None:
        result = await self.db.execute(
            select(FundingRequest).where(FundingRequest.id == id)
        )
        return result.scalar_one_or_none()

    async def get_by_professor(self, professor_id: UUID) -> list[FundingRequest]:
        result = await self.db.execute(
            select(FundingRequest)
            .where(FundingRequest.professor_id == professor_id)
            .order_by(FundingRequest.submitted_at.desc())
        )
        return list(result.scalars().all())

    async def get_all_detail(self, status: FundingStatus | None = None) -> list[dict]:
        stmt = (
            select(
                FundingRequest.id,
                FundingRequest.amount,
                FundingRequest.purpose,
                FundingRequest.status,
                FundingRequest.submitted_at,
                FundingRequest.reviewed_at,
                FundingRequest.professor_id,
                User.username,
                User.email,
                FundingRequest.lab_id,
                Lab.name,
                Lab.department,
            )
            .join(Professor, FundingRequest.professor_id == Professor.id)
            .join(User, Professor.user_id == User.id)
            .outerjoin(Lab, FundingRequest.lab_id == Lab.id)
            .order_by(FundingRequest.submitted_at.desc())
        )
        if status is not None:
            stmt = stmt.where(FundingRequest.status == status)
        result = await self.db.execute(stmt)
        return [
            {
                "id": r[0],
                "amount": float(r[1]) if r[1] is not None else 0.0,
                "purpose": r[2],
                "status": r[3],
                "submitted_at": r[4],
                "reviewed_at": r[5],
                "professor_id": r[6],
                "professor_username": r[7],
                "professor_email": r[8],
                "lab_id": r[9],
                "lab_name": r[10],
                "lab_department": r[11],
            }
            for r in result.all()
        ]

    async def create(self, req: FundingRequest) -> FundingRequest:
        self.db.add(req)
        await self.db.commit()
        await self.db.refresh(req)
        return req

    async def update_status(self, id: UUID, status: FundingStatus) -> None:
        req = await self.get_by_id(id)
        if req:
            from datetime import datetime
            req.status = status
            req.reviewed_at = datetime.utcnow()
            await self.db.commit()
