import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const { login, isLoading, error } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await login(username, password)
    const user = JSON.parse(localStorage.getItem('current_user') ?? 'null')
    if (user) navigate('/dashboard')
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Undergraduate Lab Portal</h1>
        <p style={styles.subtitle}>Sign in to your account</p>
        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Username</label>
          <input
            style={styles.input}
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="Enter your username"
          />
          <label style={styles.label}>Password</label>
          <input
            style={styles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
          />
          {error && <p style={styles.error}>{error}</p>}
          <button style={styles.button} type="submit" disabled={isLoading}>
            {isLoading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        <p style={styles.registerLink}>
          Don't have an account?{' '}
          <span
            style={{ color: '#2563eb', cursor: 'pointer' }}
            onClick={() => navigate('/register')}
          >
            Register
          </span>
        </p>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', background: '#f1f5f9',
  },
  card: {
    background: '#fff', padding: '2rem', borderRadius: '12px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)', width: '100%', maxWidth: '400px',
  },
  title: { fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' },
  subtitle: { color: '#64748b', marginBottom: '1.5rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  label: { fontWeight: 500, fontSize: '0.875rem', color: '#374151' },
  input: {
    padding: '0.625rem 0.875rem', border: '1px solid #d1d5db',
    borderRadius: '8px', fontSize: '0.95rem', outline: 'none',
  },
  button: {
    marginTop: '0.5rem', padding: '0.75rem', background: '#2563eb',
    color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem',
    fontWeight: 600, cursor: 'pointer',
  },
  error: { color: '#dc2626', fontSize: '0.875rem' },
  registerLink: { textAlign: 'center', marginTop: '1rem', color: '#64748b', fontSize: '0.875rem' },
}

export default LoginPage
