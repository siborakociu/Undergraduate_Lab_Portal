import type {
  ApplicationCreate,
  ApplicationOut,
  ApplicationStatusUpdate,
} from '../types'
import apiClient from './apiClient'

export const applicationApi = {
  create: (dto: ApplicationCreate) =>
    apiClient.post<ApplicationOut>('/applications', dto),

  getByStudent: (studentId: string) =>
    apiClient.get<ApplicationOut[]>(`/applications/student/${studentId}`),

  getByPosition: (positionId: string) =>
    apiClient.get<ApplicationOut[]>(`/applications/position/${positionId}`),

  updateStatus: (id: string, dto: ApplicationStatusUpdate) =>
    apiClient.put(`/applications/${id}/status`, dto),
}
