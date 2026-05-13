import type { StudentProfileCreate, StudentProfileOut, StudentProfileUpdate } from '../types'
import apiClient from './apiClient'

export const studentApi = {
  getProfile: (id: string) =>
    apiClient.get<StudentProfileOut>(`/students/${id}/profile`),

  createProfile: (dto: StudentProfileCreate) =>
    apiClient.post<StudentProfileOut>('/students/profile', dto),

  updateProfile: (id: string, dto: StudentProfileUpdate) =>
    apiClient.put<StudentProfileOut>(`/students/${id}/profile`, dto),
}
