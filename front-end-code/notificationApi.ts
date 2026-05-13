import type { NotificationOut } from '../types'
import apiClient from './apiClient'

export const notificationApi = {
  getNotifications: (userId: string) =>
    apiClient.get<NotificationOut[]>(`/notifications/${userId}`),

  markRead: (id: string) =>
    apiClient.put(`/notifications/${id}/read`),
}
