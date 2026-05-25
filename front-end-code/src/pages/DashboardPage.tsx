import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const roleDescriptions: Record<string, string> = {
  STUDENT:   'Explore research opportunities, track your applications, and manage your academic profile.',
  PROFESSOR: 'Post positions, review applicants, manage your lab, and request funding.',
  HR_STAFF:  'Oversee external programs and review program applicants.',
  ADMIN:     'Monitor research activity, lab compliance, funding, and generate reports.',
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  if (!user) {
    navigate('/login')
    return null
  }

  return (
    <div style={styles.page}>
      <div style={styles.welcomeCard}>
        <div style={styles.iconCircle}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 01-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
          </svg>
        </div>
        <div>
          <h1 style={styles.welcomeText}>
            Welcome back, <span style={styles.usernameHighlight}>{user.username}</span>
          </h1>
          <span style={styles.roleBadge}>{user.role.replace('_', ' ')}</span>
          <p style={styles.description}>{roleDescriptions[user.role] ?? ''}</p>
        </div>
      </div>

      <div style={styles.hintBox}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <path d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
        </svg>
        <p style={styles.hintText}>Use the sidebar on the left to navigate between sections.</p>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 55%, #dbeafe 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    gap: '1.25rem',
  },
  welcomeCard: {
    background: 'rgba(255,255,255,0.88)',
    borderRadius: '20px',
    boxShadow: '0 8px 32px rgba(37,99,235,0.10)',
    padding: '2.5rem 3rem',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1.75rem',
    maxWidth: '560px',
    width: '100%',
    border: '1px solid #bae6fd',
    backdropFilter: 'blur(4px)',
  },
  iconCircle: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #2563eb, #0891b2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 4px 16px rgba(37,99,235,0.3)',
  },
  welcomeText: {
    fontSize: '1.6rem',
    fontWeight: 700,
    color: '#0f172a',
    margin: '0 0 0.5rem',
    lineHeight: 1.2,
  },
  usernameHighlight: { color: '#2563eb' },
  roleBadge: {
    display: 'inline-block',
    background: '#dbeafe',
    color: '#1d4ed8',
    fontSize: '0.7rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.09em',
    borderRadius: '999px',
    padding: '0.2rem 0.8rem',
    marginBottom: '0.85rem',
  },
  description: {
    color: '#475569',
    fontSize: '0.95rem',
    lineHeight: 1.65,
    margin: 0,
  },
  hintBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    background: 'rgba(255,255,255,0.6)',
    border: '1px dashed #93c5fd',
    borderRadius: '12px',
    padding: '0.85rem 1.4rem',
    maxWidth: '560px',
    width: '100%',
    backdropFilter: 'blur(4px)',
  },
  hintText: { color: '#64748b', fontSize: '0.875rem', margin: 0 },
}

export default DashboardPage
