import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  if (!user) {
    navigate('/login')
    return null
  }

  const roleCards: Record<string, { label: string; path: string; color: string }[]> = {
    STUDENT: [
      { label: 'Browse Opportunities', path: '/opportunities', color: '#2563eb' },
      { label: 'My Applications', path: '/applications', color: '#7c3aed' },
      { label: 'My Profile', path: '/profile', color: '#059669' },
    ],
    PROFESSOR: [
      { label: 'Manage Positions', path: '/opportunities', color: '#2563eb' },
      { label: 'View Applicants', path: '/applications', color: '#7c3aed' },
      { label: 'Lab Management', path: '/lab', color: '#d97706' },
    ],
    HR_STAFF: [
      { label: 'International Programs', path: '/programs', color: '#2563eb' },
      { label: 'All Applications', path: '/applications', color: '#7c3aed' },
    ],
    ADMIN: [
      { label: 'Funding Requests', path: '/admin', color: '#2563eb' },
      { label: 'Stipends', path: '/admin', color: '#7c3aed' },
      { label: 'All Labs', path: '/lab', color: '#d97706' },
      { label: 'Reports', path: '/admin', color: '#059669' },
    ],
  }

  const cards = roleCards[user.role] ?? []

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Welcome, {user.username}</h1>
          <p style={styles.subtitle}>Role: {user.role.replace('_', ' ')}</p>
        </div>
        <button style={styles.logoutBtn} onClick={logout}>Sign Out</button>
      </div>
      <div style={styles.grid}>
        {cards.map((card) => (
          <div
            key={card.path + card.label}
            style={{ ...styles.card, borderTop: `4px solid ${card.color}` }}
            onClick={() => navigate(card.path)}
          >
            <p style={{ ...styles.cardLabel, color: card.color }}>{card.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: '900px', margin: '0 auto', padding: '2rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
  title: { fontSize: '1.75rem', fontWeight: 700 },
  subtitle: { color: '#64748b', marginTop: '0.25rem' },
  logoutBtn: { padding: '0.5rem 1rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' },
  card: { background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', cursor: 'pointer', transition: 'transform 0.15s' },
  cardLabel: { fontWeight: 600, fontSize: '1rem' },
}

export default DashboardPage
