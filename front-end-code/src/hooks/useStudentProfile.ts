import { useEffect, useState } from 'react'
import { studentApi } from '../api/studentApi'
import type { StudentProfileOut, StudentProfileUpdate } from '../types'

export const useStudentProfile = (studentId?: string) => {
  const [profile, setProfile] = useState<StudentProfileOut | null>(null)
  const [isLoading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!studentId) return
    setLoading(true)
    setError(null)
    studentApi.getProfile(studentId)
      .then((res) => setProfile(res.data))
      .catch((err: unknown) => {
        const status = (err as { response?: { status?: number } })?.response?.status
        if (status === 404) {
          setProfile(null)
        } else {
          setError('Failed to load profile')
        }
      })
      .finally(() => setLoading(false))
  }, [studentId])

  const updateProfile = async (dto: StudentProfileUpdate) => {
    if (!studentId) return
    setLoading(true)
    setError(null)
    try {
      const res = await studentApi.updateProfile(studentId, dto)
      setProfile(res.data)
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return { profile, updateProfile, isLoading, error }
}
