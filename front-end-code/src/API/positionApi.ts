import type { PositionCreate, PositionFilters, PositionOut, PositionStatus } from '../types'
import apiClient from './apiClient'

export const positionApi = {
  getPositions: () =>
    apiClient.get<PositionOut[]>('/positions'),

  filterPositions: (filters: PositionFilters) =>
    apiClient.get<PositionOut[]>('/positions/filter', { params: filters }),

  createPosition: (dto: PositionCreate) =>
    apiClient.post<PositionOut>('/positions', dto),

  updateStatus: (id: string, status: PositionStatus) =>
    apiClient.put(`/positions/${id}/status`, { status }),
}
