import { useEffect, useState } from 'react'
import { labApi } from '../api/labApi'
import type { LabMemberOut, RosterAddRequest } from '../types'

export const useLabRoster = (labId?: string) => {
  const [roster, setRoster] = useState<LabMemberOut[]>([])
  const [isLoading, setLoading] = useState(false)

  useEffect(() => {
    if (!labId) return
    setLoading(true)
    labApi.getRoster(labId)
      .then((res) => setRoster(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [labId])

  const addMember = async (dto: RosterAddRequest) => {
    if (!labId) return
    const res = await labApi.addMember(labId, dto)
    setRoster((prev) => [...prev, res.data])
  }

  const removeMember = async (memberId: string) => {
    if (!labId) return
    await labApi.removeMember(labId, memberId)
    setRoster((prev) => prev.filter((m) => m.id !== memberId))
  }

  return { roster, addMember, removeMember, isLoading }
}
