import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.models.base import Base


class LabMember(Base):
    __tablename__ = "lab_members"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    lab_id = Column(UUID(as_uuid=True), ForeignKey("labs.id"), nullable=False)
    student_id = Column(UUID(as_uuid=True), ForeignKey("student_profiles.id"), nullable=False)
    role = Column(String(60))
    joined_at = Column(DateTime, default=datetime.utcnow)

    lab = relationship("Lab", back_populates="members")
    student = relationship("StudentProfile", back_populates="lab_memberships")
