from uuid import UUID

from app.models.audit_log import AuditLog
from app.repositories.audit_repository import AuditRepository


class AuditService:
    def __init__(self, audit_repo: AuditRepository):
        self.repo = audit_repo

    async def log_action(self, user_id: UUID, action: str,
                         entity_type: str, entity_id: UUID) -> None:
        log = AuditLog(
            user_id=user_id,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
        )
        await self.repo.create(log)

    async def get_audit_log(self, entity_id: UUID) -> list:
        return await self.repo.get_by_entity(entity_id)

    async def export_logs(self, filters: dict) -> list:
        return await self.repo.get_all()
