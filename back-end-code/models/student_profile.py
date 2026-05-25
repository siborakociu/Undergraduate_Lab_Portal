import uuid

from sqlalchemy import Boolean, Column, ForeignKey, Numeric, String
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.orm import relationship

from app.models.base import Base


class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, unique=True)
    full_name = Column(String(100), nullable=False)
    gpa = Column(Numeric(3, 2))
    major = Column(String(80))
    skills = Column(ARRAY(String), default=list)
    is_complete = Column(Boolean, default=False)

    user = relationship("User", back_populates="profile")
    documents = relationship("Document", back_populates="student")
    applications = relationship("Application", back_populates="student")
    stipends = relationship("Stipend", back_populates="student")
    lab_memberships = relationship("LabMember", back_populates="student")
