import { useEffect, useState } from 'react'
import { notificationApi } from '../api/notificationApi'
import type { NotificationOut } from '../types'

export const useNotifications = (userId?: string) => {
  const [notifications, setNotifications] = useState<NotificationOut[]>([])
  const unreadCount = notifications.filter((n) => !n.is_read).length

  useEffect(() => {
    if (!userId) return
    notificationApi.getNotifications(userId)
      .then((res) => setNotifications(res.data))
      .catch(() => {})
  }, [userId])

  const markRead = async (id: string) => {
    await notificationApi.markRead(id)
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
    )
  }

  return { notifications, unreadCount, markRead }
}
