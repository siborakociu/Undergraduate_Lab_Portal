import type { FundingDecision, FundingRequestOut } from '../types'
import apiClient from './apiClient'

export const fundingApi = {
  getPendingRequests: () =>
    apiClient.get<FundingRequestOut[]>('/funding/requests'),

  recordDecision: (id: string, dto: FundingDecision) =>
    apiClient.post(`/funding/requests/${id}/decide`, dto),
}
