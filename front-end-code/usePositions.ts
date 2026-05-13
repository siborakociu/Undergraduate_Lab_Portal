import { useEffect, useState } from 'react'
import { positionApi } from '../api/positionApi'
import type { PositionFilters, PositionOut } from '../types'

export const usePositions = (filters?: PositionFilters) => {
  const [positions, setPositions] = useState<PositionOut[]>([])
  const [isLoading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    const fetch = filters && Object.values(filters).some(Boolean)
      ? positionApi.filterPositions(filters)
      : positionApi.getPositions()

    fetch
      .then((res) => setPositions(res.data))
      .catch(() => setError('Failed to load positions'))
      .finally(() => setLoading(false))
  }, [filters?.dept, filters?.gpa])

  return { positions, isLoading, error }
}
