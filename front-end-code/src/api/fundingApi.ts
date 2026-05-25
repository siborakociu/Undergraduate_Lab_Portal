import type {
  FundingDecision,
  FundingRequestCreate,
  FundingRequestDetailOut,
  FundingRequestOut,
  FundingStatus,
} from '../types'
import apiClient from './apiClient'

export const fundingApi = {
  submitRequest: (dto: FundingRequestCreate) =>
    apiClient.post<FundingRequestOut>('/funding/requests', dto),

  getMine: () =>
    apiClient.get<FundingRequestOut[]>('/funding/requests/mine'),

  getPendingRequests: () =>
    apiClient.get<FundingRequestDetailOut[]>('/funding/requests', { params: { status: 'PENDING' } }),

  getAllRequests: (status?: FundingStatus) =>
    apiClient.get<FundingRequestDetailOut[]>('/funding/requests', { params: status ? { status } : {} }),

  recordDecision: (id: string, dto: FundingDecision) =>
    apiClient.post(`/funding/requests/${id}/decide`, dto),
}
