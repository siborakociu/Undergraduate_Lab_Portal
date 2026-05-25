from uuid import UUID

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.enums import ApplicationStatus, ProgramStatus
from app.models.international_program import InternationalProgram
from app.models.program_application import ProgramApplication
from app.models.student_profile import StudentProfile
from app.models.user import User


class ProgramRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self) -> list[InternationalProgram]:
        result = await self.db.execute(select(InternationalProgram))
        return list(result.scalars().all())

    async def get_published(self) -> list[InternationalProgram]:
        result = await self.db.execute(
            select(InternationalProgram).where(
                InternationalProgram.status == ProgramStatus.PUBLISHED
            )
        )
        return list(result.scalars().all())

    async def get_by_hr_staff(self, hr_staff_id: UUID) -> list[InternationalProgram]:
        result = await self.db.execute(
            select(InternationalProgram)
            .where(InternationalProgram.hr_staff_id == hr_staff_id)
            .order_by(InternationalProgram.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_by_id(self, id: UUID) -> InternationalProgram | None:
        result = await self.db.execute(
            select(InternationalProgram).where(InternationalProgram.id == id)
        )
        return result.scalar_one_or_none()

    async def create(self, program: InternationalProgram) -> InternationalProgram:
        self.db.add(program)
        await self.db.commit()
        await self.db.refresh(program)
        return program

    async def update(self, program: InternationalProgram) -> InternationalProgram:
        await self.db.commit()
        await self.db.refresh(program)
        return program


class ProgramApplicationRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, app: ProgramApplication) -> ProgramApplication:
        self.db.add(app)
        await self.db.commit()
        await self.db.refresh(app)
        return app

    async def get_by_id(self, id: UUID) -> ProgramApplication | None:
        result = await self.db.execute(
            select(ProgramApplication).where(ProgramApplication.id == id)
        )
        return result.scalar_one_or_none()

    async def check_duplicate(self, student_id: UUID, program_id: UUID) -> bool:
        result = await self.db.execute(
            select(ProgramApplication).where(
                and_(
                    ProgramApplication.student_id == student_id,
                    ProgramApplication.program_id == program_id,
                )
            )
        )
        return result.scalar_one_or_none() is not None

    async def get_for_student(self, student_id: UUID) -> list[dict]:
        result = await self.db.execute(
            select(
                ProgramApplication.id,
                ProgramApplication.program_id,
                InternationalProgram.title,
                InternationalProgram.country,
                ProgramApplication.status,
                ProgramApplication.submitted_at,
                ProgramApplication.decision_at,
                ProgramApplication.decision_notes,
            )
            .join(InternationalProgram, ProgramApplication.program_id == InternationalProgram.id)
            .where(ProgramApplication.student_id == student_id)
            .order_by(ProgramApplication.submitted_at.desc())
        )
        return [
            {
                "id": r[0],
                "program_id": r[1],
                "program_title": r[2],
                "program_country": r[3],
                "status": r[4],
                "submitted_at": r[5],
                "decision_at": r[6],
                "decision_notes": r[7],
            }
            for r in result.all()
        ]

    async def get_applicants_for_program(self, program_id: UUID) -> list[dict]:
        result = await self.db.execute(
            select(
                ProgramApplication.id,
                ProgramApplication.program_id,
                InternationalProgram.title,
                StudentProfile.id,
                User.username,
                User.email,
                StudentProfile.full_name,
                StudentProfile.gpa,
                StudentProfile.major,
                StudentProfile.skills,
                ProgramApplication.status,
                ProgramApplication.submitted_at,
                ProgramApplication.decision_at,
                ProgramApplication.decision_notes,
            )
            .join(InternationalProgram, ProgramApplication.program_id == InternationalProgram.id)
            .join(StudentProfile, ProgramApplication.student_id == StudentProfile.id)
            .join(User, StudentProfile.user_id == User.id)
            .where(ProgramApplication.program_id == program_id)
            .order_by(ProgramApplication.submitted_at.desc())
        )
        return [
            {
                "application_id": r[0],
                "program_id": r[1],
                "program_title": r[2],
                "student_profile_id": r[3],
                "username": r[4],
                "email": r[5],
                "full_name": r[6] or "",
                "gpa": float(r[7]) if r[7] is not None else None,
                "major": r[8],
                "skills": r[9] or [],
                "status": r[10],
                "submitted_at": r[11],
                "decision_at": r[12],
                "decision_notes": r[13],
            }
            for r in result.all()
        ]

    async def get_applicants_for_hr_staff(self, hr_staff_id: UUID) -> list[dict]:
        result = await self.db.execute(
            select(
                ProgramApplication.id,
                ProgramApplication.program_id,
                InternationalProgram.title,
                StudentProfile.id,
                User.username,
                User.email,
                StudentProfile.full_name,
                StudentProfile.gpa,
                StudentProfile.major,
                StudentProfile.skills,
                ProgramApplication.status,
                ProgramApplication.submitted_at,
                ProgramApplication.decision_at,
                ProgramApplication.decision_notes,
            )
            .join(InternationalProgram, ProgramApplication.program_id == InternationalProgram.id)
            .join(StudentProfile, ProgramApplication.student_id == StudentProfile.id)
            .join(User, StudentProfile.user_id == User.id)
            .where(InternationalProgram.hr_staff_id == hr_staff_id)
            .order_by(ProgramApplication.submitted_at.desc())
        )
        return [
            {
                "application_id": r[0],
                "program_id": r[1],
                "program_title": r[2],
                "student_profile_id": r[3],
                "username": r[4],
                "email": r[5],
                "full_name": r[6] or "",
                "gpa": float(r[7]) if r[7] is not None else None,
                "major": r[8],
                "skills": r[9] or [],
                "status": r[10],
                "submitted_at": r[11],
                "decision_at": r[12],
                "decision_notes": r[13],
            }
            for r in result.all()
        ]

    async def update_status(self, id: UUID, status: ApplicationStatus, notes: str | None = None) -> None:
        from datetime import datetime
        app = await self.get_by_id(id)
        if app:
            app.status = status
            app.decision_notes = notes
            app.decision_at = datetime.utcnow()
            await self.db.commit()
