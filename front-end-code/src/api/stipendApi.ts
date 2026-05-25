import type { StipendDecision, StipendDetailOut, StipendStatus } from '../types'
import apiClient from './apiClient'

export const stipendApi = {
  getPendingStipends: () =>
    apiClient.get<StipendDetailOut[]>('/stipends/pending'),

  getAll: (status?: StipendStatus) =>
    apiClient.get<StipendDetailOut[]>('/stipends', { params: status ? { status } : {} }),

  processStipend: (id: string, dto: StipendDecision) =>
    apiClient.post(`/stipends/${id}/process`, dto),
}
