from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from app.models.enums import DocumentType


class DocumentOut(BaseModel):
    id: UUID
    file_name: str
    file_url: str
    doc_type: DocumentType | None
    uploaded_at: datetime | None

    model_config = {"from_attributes": True}


class NotificationOut(BaseModel):
    id: UUID
    message: str
    is_read: bool
    created_at: datetime | None

    model_config = {"from_attributes": True}
