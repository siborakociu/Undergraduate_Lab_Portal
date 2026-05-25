from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.enums import LabStatus
from app.models.lab import Lab
from app.models.lab_member import LabMember


class LabRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_lab(self, id: UUID) -> Lab | None:
        result = await self.db.execute(select(Lab).where(Lab.id == id))
        return result.scalar_one_or_none()

    async def get_by_professor(self, professor_id: UUID) -> Lab | None:
        result = await self.db.execute(
            select(Lab).where(Lab.professor_id == professor_id)
        )
        return result.scalars().first()

    async def get_all_by_professor(self, professor_id: UUID) -> list[Lab]:
        result = await self.db.execute(
            select(Lab)
            .where(Lab.professor_id == professor_id)
            .order_by(Lab.created_at.asc())
        )
        return list(result.scalars().all())

    async def update_lab_fields(self, lab_id: UUID, fields: dict) -> Lab | None:
        lab = await self.get_lab(lab_id)
        if not lab:
            return None
        for key, value in fields.items():
            if hasattr(lab, key):
                setattr(lab, key, value)
        await self.db.commit()
        await self.db.refresh(lab)
        return lab

    async def get_all(self) -> list[Lab]:
        result = await self.db.execute(select(Lab))
        return list(result.scalars().all())

    async def get_roster(self, lab_id: UUID) -> list[LabMember]:
        result = await self.db.execute(
            select(LabMember).where(LabMember.lab_id == lab_id)
        )
        return list(result.scalars().all())

    async def get_roster_detail(self, lab_id: UUID) -> list[dict]:
        from app.models.student_profile import StudentProfile
        from app.models.user import User
        result = await self.db.execute(
            select(
                LabMember.id,
                LabMember.student_id,
                User.username,
                StudentProfile.full_name,
                User.email,
                LabMember.role,
                LabMember.joined_at,
            )
            .join(StudentProfile, LabMember.student_id == StudentProfile.id)
            .join(User, StudentProfile.user_id == User.id)
            .where(LabMember.lab_id == lab_id)
            .order_by(LabMember.joined_at.desc())
        )
        return [
            {
                "id": r[0],
                "student_id": r[1],
                "username": r[2],
                "full_name": r[3] or "",
                "email": r[4],
                "role": r[5],
                "joined_at": r[6],
            }
            for r in result.all()
        ]

    async def create_lab(self, lab: Lab) -> Lab:
        self.db.add(lab)
        await self.db.commit()
        await self.db.refresh(lab)
        return lab

    async def add_member(self, member: LabMember) -> LabMember:
        self.db.add(member)
        await self.db.commit()
        await self.db.refresh(member)
        return member

    async def remove_member(self, member_id: UUID) -> None:
        result = await self.db.execute(
            select(LabMember).where(LabMember.id == member_id)
        )
        member = result.scalar_one_or_none()
        if member:
            await self.db.delete(member)
            await self.db.commit()

    async def update_status(self, id: UUID, status: LabStatus) -> None:
        lab = await self.get_lab(id)
        if lab:
            lab.status = status
            await self.db.commit()
