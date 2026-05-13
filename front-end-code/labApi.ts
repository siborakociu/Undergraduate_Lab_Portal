import type { LabMemberOut, LabOut, RosterAddRequest } from '../types'
import apiClient from './apiClient'

export const labApi = {
  getLab: (id: string) =>
    apiClient.get<LabOut>(`/labs/${id}`),

  getRoster: (labId: string) =>
    apiClient.get<LabMemberOut[]>(`/labs/${labId}/roster`),

  addMember: (labId: string, dto: RosterAddRequest) =>
    apiClient.post<LabMemberOut>(`/labs/${labId}/roster`, dto),

  removeMember: (labId: string, memberId: string) =>
    apiClient.delete(`/labs/${labId}/roster/${memberId}`),
}
