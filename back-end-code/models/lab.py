import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, Enum, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.models.base import Base
from app.models.enums import LabStatus


class Lab(Base):
    __tablename__ = "labs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    professor_id = Column(UUID(as_uuid=True), ForeignKey("professors.id"), nullable=True)
    name = Column(String(100), nullable=False)
    department = Column(String(80))
    status = Column(Enum(LabStatus), default=LabStatus.ACTIVE)
    cert_type = Column(String(80), nullable=True)
    cert_expiry = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    professor = relationship("Professor", back_populates="labs", foreign_keys=[professor_id])
    members = relationship("LabMember", back_populates="lab")
    positions = relationship("Position", back_populates="lab")
    funding_requests = relationship("FundingRequest", back_populates="lab")
