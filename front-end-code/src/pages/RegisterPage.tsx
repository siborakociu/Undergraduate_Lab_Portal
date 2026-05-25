import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../api/authApi'
import type { UserRole } from '../types'

function validatePassword(pw: string): string | null {
  if (pw.length < 8) return 'Password must be at least 8 characters.'
  if (!/[a-z]/.test(pw)) return 'Password must contain at least one lowercase letter.'
  if (!/[A-Z]/.test(pw)) return 'Password must contain at least one uppercase letter.'
  if (!/[0-9]/.test(pw)) return 'Password must contain at least one number.'
  return null
}

const RegisterPage: React.FC = () => {
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'STUDENT' as UserRole })
  const [error, setError] = useState<string | null>(null)
  const [pwError, setPwError] = useState<string | null>(null)
  const [isLoading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handlePasswordChange = (value: string) => {
    setForm((f) => ({ ...f, password: value }))
    setPwError(value ? validatePassword(value) : null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const pwValidation = validatePassword(form.password)
    if (pwValidation) { setPwError(pwValidation); return }
    setLoading(true)
    setError(null)
    try {
      await authApi.register(form)
      navigate('/login')
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: unknown } }; message?: string })?.response?.data?.detail
      let msg: string
      if (typeof detail === 'string') {
        msg = detail
      } else if (Array.isArray(detail) && detail.length > 0) {
        msg = detail.map((d: { msg?: string; loc?: unknown[] }) => `${d.loc?.slice(1).join('.') ?? ''}: ${d.msg ?? ''}`).join('; ')
      } else {
        msg = (err as { message?: string })?.message ?? 'Registration failed'
      }
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.overlay} />
      <div style={styles.card}>
        <div style={styles.logoMark}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 01-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
          </svg>
        </div>
        <h1 style={styles.title}>Create Account</h1>
        <p style={styles.subtitle}>Join the Undergraduate Lab Portal</p>
        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Username</label>
          <input
            style={styles.input}
            type="text"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
          />
          <label style={styles.label}>Email</label>
          <input
            style={styles.input}
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <label style={styles.label}>Password</label>
          <input
            style={{ ...styles.input, borderColor: pwError ? '#dc2626' : undefined }}
            type="password"
            value={form.password}
            onChange={(e) => handlePasswordChange(e.target.value)}
            required
          />
          {pwError && <p style={styles.pwHint}>{pwError}</p>}
          <p style={styles.pwReq}>Min 8 chars · uppercase · lowercase · number</p>
          <label style={styles.label}>Role</label>
          <select
            style={styles.input}
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
          >
            <option value="STUDENT">Student</option>
            <option value="PROFESSOR">Professor</option>
            <option value="HR_STAFF">HR Staff</option>
            <option value="ADMIN">Admin</option>
          </select>
          {error && <p style={styles.error}>{error}</p>}
          <button className="btn-primary" style={styles.button} type="submit" disabled={isLoading}>
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p style={styles.link}>
          Already have an account?{' '}
          <span
            className="auth-link"
            style={styles.linkSpan}
            onClick={() => navigate('/login')}
          >
            Sign In
          </span>
        </p>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundImage: 'url(/campus.jpg)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    position: 'relative',
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(10, 20, 40, 0.58)',
    backdropFilter: 'blur(3px)',
  },
  card: {
    position: 'relative',
    zIndex: 1,
    background: 'rgba(255,255,255,0.97)',
    padding: '2.25rem 2.5rem',
    borderRadius: '16px',
    boxShadow: '0 24px 64px rgba(0,0,0,0.35)',
    width: '100%',
    maxWidth: '400px',
  },
  logoMark: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '0.75rem',
  },
  title: {
    fontSize: '1.4rem',
    fontWeight: 700,
    marginBottom: '0.2rem',
    textAlign: 'center',
    color: '#0f172a',
  },
  subtitle: {
    color: '#64748b',
    marginBottom: '1.5rem',
    textAlign: 'center',
    fontSize: '0.875rem',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  label: { fontWeight: 500, fontSize: '0.875rem', color: '#374151' },
  input: {
    padding: '0.625rem 0.875rem',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '0.95rem',
    background: '#f8fafc',
    width: '100%',
  },
  button: {
    marginTop: '0.5rem',
    padding: '0.75rem',
    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(37,99,235,0.28)',
  },
  error: { color: '#dc2626', fontSize: '0.875rem' },
  pwHint: { color: '#dc2626', fontSize: '0.8rem', marginTop: '-0.25rem' },
  pwReq: { color: '#94a3b8', fontSize: '0.75rem', marginTop: '-0.25rem' },
  link: {
    textAlign: 'center',
    marginTop: '1rem',
    color: '#64748b',
    fontSize: '0.875rem',
  },
  linkSpan: { color: '#2563eb', cursor: 'pointer', fontWeight: 600 },
}

export default RegisterPage
