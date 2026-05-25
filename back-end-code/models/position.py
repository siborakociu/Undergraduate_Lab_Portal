import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.models.base import Base
from app.models.enums import PositionStatus


class Position(Base):
    __tablename__ = "positions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    professor_id = Column(UUID(as_uuid=True), ForeignKey("professors.id"), nullable=False)
    lab_id = Column(UUID(as_uuid=True), ForeignKey("labs.id"), nullable=True)
    title = Column(String(120), nullable=False)
    description = Column(Text)
    status = Column(Enum(PositionStatus), default=PositionStatus.OPEN)
    required_gpa = Column(Numeric(3, 2))
    department = Column(String(80))
    stipend_per_student = Column(Numeric(12, 2))
    max_students = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)

    professor = relationship("Professor", back_populates="positions")
    lab = relationship("Lab", back_populates="positions")
    applications = relationship("Application", back_populates="position")
