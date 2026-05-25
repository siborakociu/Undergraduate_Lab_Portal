from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.document import Document


class DocumentRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_student(self, student_id: UUID) -> list[Document]:
        result = await self.db.execute(
            select(Document).where(Document.student_id == student_id)
        )
        return list(result.scalars().all())

    async def create(self, document: Document) -> Document:
        self.db.add(document)
        await self.db.commit()
        await self.db.refresh(document)
        return document

    async def delete(self, id: UUID) -> None:
        result = await self.db.execute(select(Document).where(Document.id == id))
        doc = result.scalar_one_or_none()
        if doc:
            await self.db.delete(doc)
            await self.db.commit()
