from uuid import UUID

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.application import Application
from app.models.enums import ApplicationStatus
from app.models.position import Position


class ApplicationRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_student(self, student_id: UUID) -> list[Application]:
        result = await self.db.execute(
            select(Application).where(Application.student_id == student_id)
        )
        return list(result.scalars().all())

    async def get_by_position(self, position_id: UUID) -> list[Application]:
        result = await self.db.execute(
            select(Application).where(Application.position_id == position_id)
        )
        return list(result.scalars().all())

    async def get_for_professor(self, professor_id: UUID) -> list[Application]:
        result = await self.db.execute(
            select(Application)
            .join(Position, Application.position_id == Position.id)
            .where(Position.professor_id == professor_id)
            .order_by(Application.submitted_at.desc())
        )
        return list(result.scalars().all())

    async def get_applicant_details_for_professor(self, professor_id: UUID) -> list[dict]:
        from app.models.student_profile import StudentProfile
        from app.models.user import User
        result = await self.db.execute(
            select(
                Application.id,
                Application.position_id,
                Position.title,
                StudentProfile.id,
                User.username,
                User.email,
                StudentProfile.full_name,
                StudentProfile.gpa,
                StudentProfile.major,
                StudentProfile.skills,
                Application.status,
                Application.submitted_at,
                Application.decision_at,
                Application.decision_notes,
            )
            .join(Position, Application.position_id == Position.id)
            .join(StudentProfile, Application.student_id == StudentProfile.id)
            .join(User, StudentProfile.user_id == User.id)
            .where(Position.professor_id == professor_id)
            .order_by(Application.submitted_at.desc())
        )
        rows = result.all()
        return [
            {
                "application_id": r[0],
                "position_id": r[1],
                "position_title": r[2],
                "student_profile_id": r[3],
                "username": r[4],
                "email": r[5],
                "full_name": r[6],
                "gpa": float(r[7]) if r[7] is not None else None,
                "major": r[8],
                "skills": r[9] or [],
                "status": r[10],
                "submitted_at": r[11],
                "decision_at": r[12],
                "decision_notes": r[13],
            }
            for r in rows
        ]

    async def get_applicant_detail(self, application_id: UUID) -> dict | None:
        from app.models.student_profile import StudentProfile
        from app.models.user import User
        result = await self.db.execute(
            select(
                Application.id,
                Application.position_id,
                Position.title,
                StudentProfile.id,
                User.username,
                User.email,
                StudentProfile.full_name,
                StudentProfile.gpa,
                StudentProfile.major,
                StudentProfile.skills,
                Application.status,
                Application.submitted_at,
                Application.decision_at,
                Application.decision_notes,
            )
            .join(Position, Application.position_id == Position.id)
            .join(StudentProfile, Application.student_id == StudentProfile.id)
            .join(User, StudentProfile.user_id == User.id)
            .where(Application.id == application_id)
        )
        r = result.first()
        if not r:
            return None
        return {
            "application_id": r[0],
            "position_id": r[1],
            "position_title": r[2],
            "student_profile_id": r[3],
            "username": r[4],
            "email": r[5],
            "full_name": r[6],
            "gpa": float(r[7]) if r[7] is not None else None,
            "major": r[8],
            "skills": r[9] or [],
            "status": r[10],
            "submitted_at": r[11],
            "decision_at": r[12],
            "decision_notes": r[13],
        }

    async def get_by_id(self, id: UUID) -> Application | None:
        result = await self.db.execute(select(Application).where(Application.id == id))
        return result.scalar_one_or_none()

    async def create(self, application: Application) -> Application:
        self.db.add(application)
        await self.db.commit()
        await self.db.refresh(application)
        return application

    async def update_status(self, id: UUID, status: ApplicationStatus,
                             notes: str | None = None) -> None:
        app = await self.get_by_id(id)
        if app:
            from datetime import datetime
            app.status = status
            app.decision_notes = notes
            app.decision_at = datetime.utcnow()
            await self.db.commit()

    async def check_duplicate(self, student_id: UUID, position_id: UUID) -> bool:
        result = await self.db.execute(
            select(Application).where(
                and_(
                    Application.student_id == student_id,
                    Application.position_id == position_id,
                )
            )
        )
        return result.scalar_one_or_none() is not None
