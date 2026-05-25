import type {
  ApplicationStatus,
  ProgramApplicantOut,
  ProgramCreate,
  ProgramOut,
  ProgramUpdate,
  StudentProgramApplicationOut,
} from '../types'
import apiClient from './apiClient'

export const programApi = {
  getPrograms: () => apiClient.get<ProgramOut[]>('/programs'),

  getMine: () => apiClient.get<ProgramOut[]>('/programs/mine'),

  publishProgram: (dto: ProgramCreate) => apiClient.post<ProgramOut>('/programs', dto),

  updateProgram: (id: string, dto: ProgramUpdate) =>
    apiClient.put<ProgramOut>(`/programs/${id}`, dto),

  apply: (id: string) => apiClient.post<{ id: string; status: string }>(`/programs/${id}/apply`),

  myApplications: () => apiClient.get<StudentProgramApplicationOut[]>('/programs/me/applications'),

  getApplicants: (id: string) =>
    apiClient.get<ProgramApplicantOut[]>(`/programs/${id}/applicants`),

  getAllApplicants: () => apiClient.get<ProgramApplicantOut[]>('/programs/applicants'),

  updateApplicationStatus: (id: string, status: ApplicationStatus, decision_notes?: string) =>
    apiClient.put(`/programs/applications/${id}/status`, { status, decision_notes }),
}
