import { useEffect, useState } from 'react'
import { applicationApi } from '../api/applicationApi'
import type { ApplicationCreate, ApplicationOut } from '../types'

export const useApplications = (enabled: boolean = true) => {
  const [applications, setApplications] = useState<ApplicationOut[]>([])
  const [isLoading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled) return
    setLoading(true)
    setError(null)
    applicationApi.getMine()
      .then((res) => setApplications(res.data))
      .catch(() => setError('Failed to load applications'))
      .finally(() => setLoading(false))
  }, [enabled])

  const submit = async (dto: ApplicationCreate) => {
    setLoading(true)
    setError(null)
    try {
      const res = await applicationApi.create(dto)
      setApplications((prev) => [...prev, res.data])
      return res.data
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Failed to submit application')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { applications, submit, isLoading, error }
}
