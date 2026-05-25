import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.models.base import Base
from app.models.enums import ProgramStatus


class InternationalProgram(Base):
    __tablename__ = "international_programs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    hr_staff_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title = Column(String(160), nullable=False)
    country = Column(String(80))
    deadline = Column(DateTime)
    description = Column(Text)
    required_gpa = Column(Numeric(3, 2))
    status = Column(Enum(ProgramStatus), default=ProgramStatus.DRAFT)
    created_at = Column(DateTime, default=datetime.utcnow)

    hr_staff = relationship("User")
    applications = relationship("Application", back_populates="program")
    program_applications = relationship("ProgramApplication", back_populates="program")
