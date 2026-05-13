import { useState } from 'react'
import { authApi } from '../api/authApi'
import type { UserOut } from '../types'

function getUserFromToken(): UserOut | null {
  const token = localStorage.getItem('access_token')
  const raw = localStorage.getItem('current_user')
  if (!token || !raw) return null
  try {
    return JSON.parse(raw) as UserOut
  } catch {
    return null
  }
}

export const useAuth = () => {
  const [user, setUser] = useState<UserOut | null>(getUserFromToken)
  const [isLoading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const login = async (username: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await authApi.login({ username, password })
      const { access_token, role } = res.data
      localStorage.setItem('access_token', access_token)
      const userObj: UserOut = { id: '', username, email: '', role: role as UserOut['role'] }
      localStorage.setItem('current_user', JSON.stringify(userObj))
      setUser(userObj)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setError(msg ?? 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    const token = localStorage.getItem('access_token') ?? ''
    try {
      await authApi.logout(token)
    } finally {
      localStorage.removeItem('access_token')
      localStorage.removeItem('current_user')
      setUser(null)
    }
  }

  return { user, login, logout, isLoading, error }
}
