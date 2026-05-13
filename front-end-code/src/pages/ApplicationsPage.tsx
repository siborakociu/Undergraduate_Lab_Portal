import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useApplications } from '../hooks/useApplications'

const statusColors: Record<string, string> = {
  SUBMITTED: '#2563eb',
  UNDER_REVIEW: '#d97706',
  ACCEPTED: '#059669',
  REJECTED: '#dc2626',
  WITHDRAWN: '#64748b',
}

const ApplicationsPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { applications, isLoading, error } = useApplications(user?.id)

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>My Applications</h1>
        <button style={styles.backBtn} onClick={() => navigate('/dashboard')}>Back</button>
      </div>

      {error && <p style={styles.error}>{error}</p>}
      {isLoading && <p style={styles.loading}>Loading…</p>}

      {!isLoading && applications.length === 0 && (
        <div style={styles.empty}>
          <p>You haven't applied to any positions yet.</p>
          <button style={styles.browseBtn} onClick={() => navigate('/opportunities')}>
            Browse Positions
          </button>
        </div>
      )}

      <div style={styles.list}>
        {applications.map((app) => (
          <div key={app.id} style={styles.card}>
            <div style={styles.cardRow}>
              <span style={styles.label}>Position ID:</span>
              <span style={styles.value}>{app.position_id}</span>
            </div>
            <div style={styles.cardRow}>
              <span style={styles.label}>Submitted:</span>
              <span style={styles.value}>{new Date(app.submitted_at).toLocaleDateString()}</span>
            </div>
            <div style={styles.cardRow}>
              <span style={styles.label}>Status:</span>
              <span style={{
                ...styles.badge,
                background: statusColors[app.status] ?? '#64748b',
              }}>
                {app.status.replace('_', ' ')}
              </span>
            </div>
            {app.decision_at && (
              <div style={styles.cardRow}>
                <span style={styles.label}>Decision:</span>
                <span style={styles.value}>{new Date(app.decision_at).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: '800px', margin: '0 auto', padding: '2rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  title: { fontSize: '1.75rem', fontWeight: 700 },
  backBtn: { padding: '0.5rem 1rem', background: '#e2e8f0', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  list: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  card: { background: '#fff', padding: '1.25rem', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' },
  cardRow: { display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' },
  label: { fontWeight: 600, fontSize: '0.875rem', color: '#374151', minWidth: '100px' },
  value: { color: '#64748b', fontSize: '0.875rem' },
  badge: { padding: '2px 10px', borderRadius: '12px', color: '#fff', fontSize: '0.8rem', fontWeight: 600 },
  error: { color: '#dc2626' },
  loading: { color: '#64748b' },
  empty: { textAlign: 'center', padding: '3rem', color: '#64748b' },
  browseBtn: { marginTop: '1rem', padding: '0.625rem 1.25rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 },
}

export default ApplicationsPage
