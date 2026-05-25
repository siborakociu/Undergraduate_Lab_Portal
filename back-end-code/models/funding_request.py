import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Numeric, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.models.base import Base
from app.models.enums import FundingStatus


class FundingRequest(Base):
    __tablename__ = "funding_requests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    professor_id = Column(UUID(as_uuid=True), ForeignKey("professors.id"), nullable=False)
    lab_id = Column(UUID(as_uuid=True), ForeignKey("labs.id"), nullable=True)
    amount = Column(Numeric(12, 2), nullable=False)
    purpose = Column(Text)
    status = Column(Enum(FundingStatus), default=FundingStatus.PENDING)
    submitted_at = Column(DateTime, default=datetime.utcnow)
    reviewed_at = Column(DateTime, nullable=True)

    professor = relationship("Professor", back_populates="funding_requests")
    lab = relationship("Lab", back_populates="funding_requests")
