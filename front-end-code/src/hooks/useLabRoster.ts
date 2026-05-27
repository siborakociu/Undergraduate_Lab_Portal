import { useEffect, useState } from 'react'
import { labApi } from '../api/labApi'
import type { LabMemberDetail, RosterAddRequest } from '../types'

export const useLabRoster = (labId?: string) => {
  const [roster, setRoster] = useState<LabMemberDetail[]>([])
  const [isLoading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    if (!labId) return
    setLoading(true)
    setError(null)
    try {
      const res = await labApi.getRosterDetail(labId)
      setRoster(res.data)
    } catch {
      setError('Failed to load roster')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [labId])

  const addMember = async (dto: RosterAddRequest) => {
    if (!labId) return
    setError(null)
    try {
      await labApi.addMember(labId, dto)
      await load()
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Failed to add member')
      throw err
    }
  }

  const removeMember = async (memberId: string) => {
    if (!labId) return
    await labApi.removeMember(labId, memberId)
    setRoster((prev) => prev.filter((m) => m.id !== memberId))
  }

  return { roster, addMember, removeMember, isLoading, error }
}
