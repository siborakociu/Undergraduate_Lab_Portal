import type { TokenResponse, UserOut } from '../types'
import apiClient from './apiClient'

interface LoginRequest { username: string; password: string }
interface RegisterRequest { username: string; email: string; password: string; role: string }

export const authApi = {
  login: (dto: LoginRequest) =>
    apiClient.post<TokenResponse>('/auth/login', dto),

  register: (dto: RegisterRequest) =>
    apiClient.post<UserOut>('/auth/register', dto),

  logout: (token: string) =>
    apiClient.post('/auth/logout', null, { params: { token } }),
}
