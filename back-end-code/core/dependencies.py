from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import decode_token
from app.infrastructure.audit_service import AuditService
from app.infrastructure.email_service import EmailService
from app.infrastructure.file_storage_service import FileStorageService
from app.core.config import settings
from app.models.enums import UserRole
from app.repositories.application_repository import ApplicationRepository
from app.repositories.audit_repository import AuditRepository
from app.repositories.document_repository import DocumentRepository
from app.repositories.funding_repository import FundingRepository
from app.repositories.lab_repository import LabRepository
from app.repositories.notification_repository import NotificationRepository
from app.repositories.position_repository import PositionRepository
from app.repositories.professor_repository import ProfessorRepository
from app.repositories.program_repository import ProgramApplicationRepository, ProgramRepository
from app.repositories.stipend_repository import StipendRepository
from app.repositories.student_repository import StudentRepository
from app.repositories.user_repository import UserRepository
from app.services.application_service import ApplicationService
from app.services.auth_service import AuthService
from app.services.document_service import DocumentService
from app.services.funding_service import FundingService
from app.services.lab_service import LabService
from app.services.notification_service import NotificationService
from app.services.position_service import PositionService
from app.services.program_service import ProgramService
from app.services.stipend_service import StipendService
from app.services.student_service import StudentService

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
):
    try:
        payload = decode_token(token)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    user_id = payload.get("sub")
    user_repo = UserRepository(db)
    user = await user_repo.get_by_id(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


async def get_current_professor(
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.role != UserRole.PROFESSOR:
        raise HTTPException(status_code=403, detail="Professors only")
    return await ProfessorRepository(db).get_or_create(current_user.id)


def get_auth_service(db: AsyncSession = Depends(get_db)) -> AuthService:
    return AuthService(UserRepository(db))


def get_student_service(db: AsyncSession = Depends(get_db)) -> StudentService:
    return StudentService(StudentRepository(db))


def get_position_service(db: AsyncSession = Depends(get_db)) -> PositionService:
    return PositionService(PositionRepository(db), LabRepository(db), StipendRepository(db))


def get_notification_service(db: AsyncSession = Depends(get_db)) -> NotificationService:
    return NotificationService(NotificationRepository(db))


def get_app_service(db: AsyncSession = Depends(get_db)) -> ApplicationService:
    return ApplicationService(
        ApplicationRepository(db),
        StudentRepository(db),
        NotificationService(NotificationRepository(db)),
    )


def get_program_service(db: AsyncSession = Depends(get_db)) -> ProgramService:
    return ProgramService(
        ProgramRepository(db),
        ProgramApplicationRepository(db),
        StudentRepository(db),
        NotificationService(NotificationRepository(db)),
    )


async def get_current_hr_staff(current_user=Depends(get_current_user)):
    if current_user.role != UserRole.HR_STAFF:
        raise HTTPException(status_code=403, detail="HR staff only")
    return current_user


def get_funding_service(db: AsyncSession = Depends(get_db)) -> FundingService:
    email_svc = EmailService(settings.SMTP_HOST, settings.SMTP_PORT, settings.SMTP_SENDER)
    audit_svc = AuditService(AuditRepository(db))
    return FundingService(
        FundingRepository(db),
        email_svc,
        audit_svc,
        LabRepository(db),
        NotificationService(NotificationRepository(db)),
    )


def get_stipend_service(db: AsyncSession = Depends(get_db)) -> StipendService:
    email_svc = EmailService(settings.SMTP_HOST, settings.SMTP_PORT, settings.SMTP_SENDER)
    return StipendService(
        StipendRepository(db),
        email_svc,
        NotificationService(NotificationRepository(db)),
    )


def get_lab_service(db: AsyncSession = Depends(get_db)) -> LabService:
    return LabService(LabRepository(db))


def get_notif_service(db: AsyncSession = Depends(get_db)) -> NotificationService:
    return NotificationService(NotificationRepository(db))


def get_document_service(db: AsyncSession = Depends(get_db)) -> DocumentService:
    storage_svc = FileStorageService(settings.STORAGE_PATH)
    return DocumentService(DocumentRepository(db), storage_svc)
