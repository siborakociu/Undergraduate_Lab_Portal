import type {
  ApplicantOut,
  ApplicationCreate,
  ApplicationOut,
  ApplicationStatusUpdate,
} from '../types'
import apiClient from './apiClient'

export const applicationApi = {
  create: (dto: ApplicationCreate) =>
    apiClient.post<ApplicationOut>('/applications', dto),

  getMine: () =>
    apiClient.get<ApplicationOut[]>('/applications/me'),

  getByPosition: (positionId: string) =>
    apiClient.get<ApplicationOut[]>(`/applications/position/${positionId}`),

  getForProfessor: () =>
    apiClient.get<ApplicantOut[]>('/applications/for-professor'),

  getApplicant: (applicationId: string) =>
    apiClient.get<ApplicantOut>(`/applications/${applicationId}/applicant`),

  updateStatus: (id: string, dto: ApplicationStatusUpdate) =>
    apiClient.put(`/applications/${id}/status`, dto),
}
