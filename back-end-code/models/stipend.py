import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Numeric, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.models.base import Base
from app.models.enums import StipendStatus


class Stipend(Base):
    __tablename__ = "stipends"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("student_profiles.id"), nullable=True)
    position_id = Column(UUID(as_uuid=True), ForeignKey("positions.id"), nullable=True)
    lab_id = Column(UUID(as_uuid=True), ForeignKey("labs.id"), nullable=True)
    amount = Column(Numeric(12, 2), nullable=False)
    purpose = Column(Text, nullable=True)
    status = Column(Enum(StipendStatus), default=StipendStatus.PENDING)
    approved_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    submitted_at = Column(DateTime, default=datetime.utcnow)
    processed_at = Column(DateTime, nullable=True)

    student = relationship("StudentProfile", back_populates="stipends")
    approved_by = relationship("User")
    position = relationship("Position")
    lab = relationship("Lab")
