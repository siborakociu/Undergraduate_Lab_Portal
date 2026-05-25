import type { AdminLabOut, AdminStatsOut, LabCertificationUpdate, LabOut } from '../types'
import apiClient from './apiClient'

export const adminApi = {
  getStats: () => apiClient.get<AdminStatsOut>('/admin/stats'),
  getAllLabs: () => apiClient.get<AdminLabOut[]>('/admin/labs'),
  setLabCertification: (id: string, dto: LabCertificationUpdate) =>
    apiClient.put<LabOut>(`/admin/labs/${id}/certification`, dto),
}
