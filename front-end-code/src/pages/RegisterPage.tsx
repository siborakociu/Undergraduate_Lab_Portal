import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../api/authApi'
import type { UserRole } from '../types'

const RegisterPage: React.FC = () => {
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'STUDENT' as UserRole })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await authApi.register(form)
      navigate('/login')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setError(msg ?? 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Create Account</h1>
        <form onSubmit={handleSubmit} style={styles.form}>
          {(['username', 'email', 'password'] as const).map((field) => (
            <React.Fragment key={field}>
              <label style={styles.label}>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
              <input
                style={styles.input}
                type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
                value={form[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                required
              />
            </React.Fragment>
          ))}
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
          <button style={styles.button} type="submit" disabled={isLoading}>
            {isLoading ? 'Registering…' : 'Register'}
          </button>
        </form>
        <p style={styles.link}>
          Already have an account?{' '}
          <span style={{ color: '#2563eb', cursor: 'pointer' }} onClick={() => navigate('/login')}>
            Sign In
          </span>
        </p>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' },
  card: { background: '#fff', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', width: '100%', maxWidth: '400px' },
  title: { fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  label: { fontWeight: 500, fontSize: '0.875rem', color: '#374151' },
  input: { padding: '0.625rem 0.875rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.95rem' },
  button: { marginTop: '0.5rem', padding: '0.75rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' },
  error: { color: '#dc2626', fontSize: '0.875rem' },
  link: { textAlign: 'center', marginTop: '1rem', color: '#64748b', fontSize: '0.875rem' },
}

export default RegisterPage
