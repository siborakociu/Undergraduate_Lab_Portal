import type { ProgramCreate, ProgramOut } from '../types'
import apiClient from './apiClient'

export const programApi = {
  getPrograms: () =>
    apiClient.get<ProgramOut[]>('/programs'),

  publishProgram: (dto: ProgramCreate) =>
    apiClient.post<ProgramOut>('/programs', dto),

  updateProgram: (id: string, dto: Partial<ProgramCreate>) =>
    apiClient.put<ProgramOut>(`/programs/${id}`, dto),
}
