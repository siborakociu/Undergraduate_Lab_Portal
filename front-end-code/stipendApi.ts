import type { StipendDecision, StipendOut } from '../types'
import apiClient from './apiClient'

export const stipendApi = {
  getPendingStipends: () =>
    apiClient.get<StipendOut[]>('/stipends/pending'),

  processStipend: (id: string, dto: StipendDecision) =>
    apiClient.post(`/stipends/${id}/process`, dto),
}
