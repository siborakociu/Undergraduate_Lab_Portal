import uuid

from sqlalchemy import Column, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.models.base import Base


class Professor(Base):
    __tablename__ = "professors"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, unique=True)
    department = Column(String(80))
    title = Column(String(60))
    lab_id = Column(UUID(as_uuid=True), ForeignKey("labs.id"), nullable=True)

    user = relationship("User")
    labs = relationship("Lab", back_populates="professor", foreign_keys="Lab.professor_id")
    positions = relationship("Position", back_populates="professor")
    funding_requests = relationship("FundingRequest", back_populates="professor")
