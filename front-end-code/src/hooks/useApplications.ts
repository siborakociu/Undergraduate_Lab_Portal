import { useEffect, useState } from 'react'
import { applicationApi } from '../api/applicationApi'
import type { ApplicationCreate, ApplicationOut } from '../types'

export const useApplications = (studentId?: string) => {
  const [applications, setApplications] = useState<ApplicationOut[]>([])
  const [isLoading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!studentId) return
    setLoading(true)
    applicationApi.getByStudent(studentId)
      .then((res) => setApplications(res.data))
      .catch(() => setError('Failed to load applications'))
      .finally(() => setLoading(false))
  }, [studentId])

  const submit = async (dto: ApplicationCreate) => {
    setLoading(true)
    try {
      const res = await applicationApi.create(dto)
      setApplications((prev) => [...prev, res.data])
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setError(msg ?? 'Failed to submit application')
    } finally {
      setLoading(false)
    }
  }

  return { applications, submit, isLoading, error }
}
