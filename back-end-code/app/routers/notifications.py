from uuid import UUID

from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_user, get_notif_service
from app.schemas.shared import NotificationOut
from app.services.notification_service import NotificationService

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("/{user_id}", response_model=list[NotificationOut])
async def get_notifications(
    user_id: UUID,
    svc: NotificationService = Depends(get_notif_service),
    current_user=Depends(get_current_user),
):
    return await svc.get_notifications(user_id)


@router.put("/{id}/read")
async def mark_read(
    id: UUID,
    svc: NotificationService = Depends(get_notif_service),
    current_user=Depends(get_current_user),
):
    await svc.mark_read(id)
    return {"detail": "marked as read"}
