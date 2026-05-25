import type {
  LabCreate,
  LabMemberDetail,
  LabMemberOut,
  LabOut,
  LabStatus,
  LabUpdate,
  PositionOut,
  RosterAddRequest,
} from '../types'
import apiClient from './apiClient'

export const labApi = {
  getLab: (id: string) =>
    apiClient.get<LabOut>(`/labs/${id}`),

  getMyLab: () =>
    apiClient.get<LabOut>('/labs/my'),

  getMine: () =>
    apiClient.get<LabOut[]>('/labs/mine'),

  create: (dto: LabCreate) =>
    apiClient.post<LabOut>('/labs', dto),

  update: (id: string, dto: LabUpdate) =>
    apiClient.put<LabOut>(`/labs/${id}`, dto),

  getPositions: (labId: string) =>
    apiClient.get<PositionOut[]>(`/labs/${labId}/positions`),

  getRoster: (labId: string) =>
    apiClient.get<LabMemberOut[]>(`/labs/${labId}/roster`),

  getRosterDetail: (labId: string) =>
    apiClient.get<LabMemberDetail[]>(`/labs/${labId}/roster/detail`),

  addMember: (labId: string, dto: RosterAddRequest) =>
    apiClient.post<LabMemberOut>(`/labs/${labId}/roster`, dto),

  removeMember: (labId: string, memberId: string) =>
    apiClient.delete(`/labs/${labId}/roster/${memberId}`),

  updateStatus: (id: string, status: LabStatus) =>
    apiClient.put(`/labs/${id}/status`, { status }),
}
