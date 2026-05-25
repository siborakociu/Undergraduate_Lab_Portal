import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.models.base import Base
from app.models.enums import ApplicationStatus


class ProgramApplication(Base):
    __tablename__ = "program_applications"
    __table_args__ = (
        UniqueConstraint("student_id", "program_id", name="uq_program_app_student_program"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("student_profiles.id"), nullable=False)
    program_id = Column(UUID(as_uuid=True), ForeignKey("international_programs.id"), nullable=False)
    status = Column(Enum(ApplicationStatus), default=ApplicationStatus.SUBMITTED)
    submitted_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    decision_at = Column(DateTime, nullable=True)
    decision_notes = Column(Text, nullable=True)

    student = relationship("StudentProfile")
    program = relationship("InternationalProgram", back_populates="program_applications")
