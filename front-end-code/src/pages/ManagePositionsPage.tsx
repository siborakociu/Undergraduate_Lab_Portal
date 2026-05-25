import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { positionApi } from '../api/positionApi'
import type { PositionOut, PositionStatus } from '../types'

const statusColors: Record<PositionStatus, string> = {
  OPEN: '#059669',
  CLOSED: '#64748b',
  FILLED: '#7c3aed',
}

const ManagePositionsPage: React.FC = () => {
  const navigate = useNavigate()
  const [positions, setPositions] = useState<PositionOut[]>([])
  const [isLoading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await positionApi.getMine()
      setPositions(res.data)
    } catch {
      setError('Failed to load your positions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const changeStatus = async (id: string, status: PositionStatus) => {
    await positionApi.updateStatus(id, status)
    setPositions((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)))
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>My Positions</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button style={styles.backBtn} onClick={() => navigate('/dashboard')}>Back</button>
          <button style={styles.createBtn} onClick={() => navigate('/positions/new')}>+ New Position</button>
        </div>
      </div>

      {error && <p style={styles.error}>{error}</p>}
      {isLoading && <p style={styles.info}>Loading…</p>}

      {!isLoading && positions.length === 0 && (
        <div style={styles.empty}>
          <p>You haven't created any positions yet.</p>
          <button style={styles.createBtn} onClick={() => navigate('/positions/new')}>
            Create your first position
          </button>
        </div>
      )}

      <div style={styles.list}>
        {positions.map((p) => (
          <div key={p.id} style={styles.card}>
            <div style={styles.cardHead}>
              <div>
                <h3 style={styles.cardTitle}>{p.title}</h3>
                <p style={styles.cardSub}>
                  {p.department ?? '—'} {p.required_gpa != null && `· Min GPA ${p.required_gpa}`}
                </p>
              </div>
              <span style={{ ...styles.badge, background: statusColors[p.status] }}>{p.status}</span>
            </div>
            {p.description && <p style={styles.desc}>{p.description}</p>}
            <div style={styles.cardActions}>
              <select
                value={p.status}
                onChange={(e) => changeStatus(p.id, e.target.value as PositionStatus)}
                style={styles.select}
              >
                <option value="OPEN">Open</option>
                <option value="FILLED">Filled</option>
                <option value="CLOSED">Closed</option>
              </select>
              <button
                style={styles.viewBtn}
                onClick={() => navigate(`/positions/${p.id}/applicants`)}
              >
                View Applicants
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: '1000px', margin: '0 auto', padding: '2rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  title: { fontSize: '1.75rem', fontWeight: 700 },
  backBtn: { padding: '0.5rem 1rem', background: '#e2e8f0', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  createBtn: { padding: '0.5rem 1rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 },
  list: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  card: { background: '#fff', padding: '1.25rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' },
  cardHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' },
  cardTitle: { fontSize: '1.1rem', fontWeight: 700 },
  cardSub: { color: '#64748b', fontSize: '0.875rem', marginTop: '0.125rem' },
  desc: { color: '#374151', fontSize: '0.9rem', marginTop: '0.75rem', marginBottom: '0.75rem' },
  badge: { padding: '4px 10px', borderRadius: '12px', color: '#fff', fontSize: '0.75rem', fontWeight: 700 },
  cardActions: { display: 'flex', gap: '0.5rem', marginTop: '0.75rem', alignItems: 'center' },
  select: { padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.875rem' },
  viewBtn: { padding: '0.4rem 0.75rem', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' },
  empty: { textAlign: 'center', padding: '3rem', color: '#64748b' },
  error: { color: '#dc2626' },
  info: { color: '#64748b' },
}

export default ManagePositionsPage
