from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user, get_lab_service
from app.models.application import Application
from app.models.enums import ApplicationStatus, FundingStatus, LabStatus, PositionStatus, UserRole
from app.models.funding_request import FundingRequest
from app.models.lab import Lab
from app.models.lab_member import LabMember
from app.models.position import Position
from app.models.professor import Professor
from app.models.user import User
from app.schemas.lab import LabCertificationUpdate, LabOut
from app.services.lab_service import LabService

router = APIRouter(prefix="/admin", tags=["admin"])


async def require_admin(current_user=Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access only")
    return current_user


class AdminStatsOut(BaseModel):
    professors: int
    students: int
    labs: int
    active_labs: int
    suspended_labs: int
    positions: int
    open_positions: int
    applications: int
    accepted_applications: int
    pending_funding: int
    approved_funding_amount: float
    expired_certs: int


class AdminLabOut(BaseModel):
    id: UUID
    name: str
    department: str | None
    status: LabStatus
    cert_type: str | None
    cert_expiry: datetime | None
    cert_state: str
    professor_username: str | None
    professor_email: str | None
    member_count: int
    position_count: int


@router.get("/stats", response_model=AdminStatsOut)
async def get_stats(
    db: AsyncSession = Depends(get_db),
    _admin=Depends(require_admin),
):
    async def count(stmt):
        r = await db.execute(stmt)
        return int(r.scalar_one())

    professors = await count(select(func.count()).select_from(Professor))
    students = await count(
        select(func.count()).select_from(User).where(User.role == UserRole.STUDENT)
    )
    labs = await count(select(func.count()).select_from(Lab))
    active_labs = await count(
        select(func.count()).select_from(Lab).where(Lab.status == LabStatus.ACTIVE)
    )
    suspended_labs = await count(
        select(func.count()).select_from(Lab).where(Lab.status == LabStatus.SUSPENDED)
    )
    positions = await count(select(func.count()).select_from(Position))
    open_positions = await count(
        select(func.count()).select_from(Position).where(Position.status == PositionStatus.OPEN)
    )
    applications = await count(select(func.count()).select_from(Application))
    accepted_applications = await count(
        select(func.count())
        .select_from(Application)
        .where(Application.status == ApplicationStatus.ACCEPTED)
    )
    pending_funding = await count(
        select(func.count())
        .select_from(FundingRequest)
        .where(FundingRequest.status == FundingStatus.PENDING)
    )
    r = await db.execute(
        select(func.coalesce(func.sum(FundingRequest.amount), 0))
        .where(FundingRequest.status == FundingStatus.APPROVED)
    )
    approved_funding_amount = float(r.scalar_one() or 0)
    r = await db.execute(
        select(func.count())
        .select_from(Lab)
        .where(Lab.cert_expiry.is_not(None), Lab.cert_expiry < datetime.utcnow())
    )
    expired_certs = int(r.scalar_one())

    return AdminStatsOut(
        professors=professors,
        students=students,
        labs=labs,
        active_labs=active_labs,
        suspended_labs=suspended_labs,
        positions=positions,
        open_positions=open_positions,
        applications=applications,
        accepted_applications=accepted_applications,
        pending_funding=pending_funding,
        approved_funding_amount=approved_funding_amount,
        expired_certs=expired_certs,
    )


@router.get("/labs", response_model=list[AdminLabOut])
async def list_all_labs(
    db: AsyncSession = Depends(get_db),
    _admin=Depends(require_admin),
):
    member_count = (
        select(LabMember.lab_id, func.count(LabMember.id).label("c"))
        .group_by(LabMember.lab_id)
        .subquery()
    )
    position_count = (
        select(Position.lab_id, func.count(Position.id).label("c"))
        .group_by(Position.lab_id)
        .subquery()
    )
    stmt = (
        select(
            Lab.id,
            Lab.name,
            Lab.department,
            Lab.status,
            Lab.cert_type,
            Lab.cert_expiry,
            User.username,
            User.email,
            func.coalesce(member_count.c.c, 0),
            func.coalesce(position_count.c.c, 0),
        )
        .outerjoin(Professor, Lab.professor_id == Professor.id)
        .outerjoin(User, Professor.user_id == User.id)
        .outerjoin(member_count, member_count.c.lab_id == Lab.id)
        .outerjoin(position_count, position_count.c.lab_id == Lab.id)
        .order_by(Lab.name)
    )
    result = await db.execute(stmt)
    now = datetime.utcnow()
    out = []
    for r in result.all():
        cert_expiry = r[5]
        if not cert_expiry:
            cert_state = "UNKNOWN"
        elif cert_expiry < now:
            cert_state = "EXPIRED"
        else:
            cert_state = "VALID"
        out.append(AdminLabOut(
            id=r[0],
            name=r[1],
            department=r[2],
            status=r[3],
            cert_type=r[4],
            cert_expiry=cert_expiry,
            cert_state=cert_state,
            professor_username=r[6],
            professor_email=r[7],
            member_count=int(r[8]),
            position_count=int(r[9]),
        ))
    return out


@router.put("/labs/{id}/certification", response_model=LabOut)
async def set_lab_certification(
    id: UUID,
    dto: LabCertificationUpdate,
    svc: LabService = Depends(get_lab_service),
    _admin=Depends(require_admin),
):
    return await svc.update_certification(id, dto)
