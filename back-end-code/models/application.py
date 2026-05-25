import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.models.base import Base
from app.models.enums import ApplicationStatus


class Application(Base):
    __tablename__ = "applications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("student_profiles.id"), nullable=False)
    position_id = Column(UUID(as_uuid=True), ForeignKey("positions.id"), nullable=False)
    program_id = Column(UUID(as_uuid=True), ForeignKey("international_programs.id"), nullable=True)
    status = Column(Enum(ApplicationStatus), default=ApplicationStatus.SUBMITTED)
    submitted_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    decision_at = Column(DateTime, nullable=True)
    decision_notes = Column(Text, nullable=True)

    student = relationship("StudentProfile", back_populates="applications")
    position = relationship("Position", back_populates="applications")
    program = relationship("InternationalProgram", back_populates="applications")
