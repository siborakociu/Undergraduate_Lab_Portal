import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { programApi } from '../api/programApi'
import type { ApplicationStatus, ProgramOut, StudentProgramApplicationOut } from '../types'

const statusColors: Record<ApplicationStatus, string> = {
  SUBMITTED: '#2563eb',
  UNDER_REVIEW: '#d97706',
  ACCEPTED: '#059669',
  REJECTED: '#dc2626',
  WITHDRAWN: '#64748b',
}

const ExternalProgramsPage: React.FC = () => {
  const navigate = useNavigate()
  const [programs, setPrograms] = useState<ProgramOut[]>([])
  const [myApps, setMyApps] = useState<StudentProgramApplicationOut[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [applyingId, setApplyingId] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const [pRes, aRes] = await Promise.all([programApi.getPrograms(), programApi.myApplications()])
      setPrograms(pRes.data)
      setMyApps(aRes.data)
    } catch {
      setError('Failed to load programs')
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const appliedSet = useMemo(() => new Set(myApps.map((a) => a.program_id)), [myApps])

  const apply = async (id: string) => {
    setApplyingId(id)
    setError(null)
    try {
      await programApi.apply(id)
      setToast('Application submitted')
      await load()
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Failed to apply')
    } finally {
      setApplyingId(null)
      setTimeout(() => setToast(null), 2500)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>External Programs</h1>
        <button style={styles.backBtn} onClick={() => navigate('/dashboard')}>Back</button>
      </div>

      {toast && <div style={styles.toast}>{toast}</div>}
      {error && <p style={styles.error}>{error}</p>}

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Open Programs</h2>
        {loading && <p style={styles.dim}>Loading…</p>}
        {!loading && programs.length === 0 && (
          <p style={styles.empty}>No programs available right now.</p>
        )}
        {programs.map((p) => {
          const applied = appliedSet.has(p.id)
          return (
            <div key={p.id} style={styles.card}>
              <div style={styles.cardHead}>
                <div style={{ flex: 1 }}>
                  <h3 style={styles.cardTitle}>{p.title}</h3>
                  <p style={styles.cardSub}>
                    {p.country ?? '—'}
                    {p.deadline && ` · Deadline ${new Date(p.deadline).toLocaleDateString()}`}
                    {p.required_gpa != null && ` · Min GPA ${p.required_gpa}`}
                  </p>
                </div>
                {applied && <span style={styles.appliedBadge}>Applied</span>}
              </div>
              {p.description && <p style={styles.desc}>{p.description}</p>}
              <div style={styles.cardActions}>
                <button
                  style={{
                    ...styles.applyBtn,
                    background: applied ? '#94a3b8' : '#2563eb',
                    cursor: applied ? 'not-allowed' : 'pointer',
                  }}
                  disabled={applied || applyingId === p.id}
                  onClick={() => apply(p.id)}
                >
                  {applied ? 'Already Applied' : (applyingId === p.id ? 'Applying…' : 'Apply')}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>My Program Applications ({myApps.length})</h2>
        {myApps.length === 0 && <p style={styles.empty}>You haven't applied to any programs yet.</p>}
        {myApps.map((a) => (
          <div key={a.id} style={styles.appCard}>
            <div style={styles.cardHead}>
              <div style={{ flex: 1 }}>
                <h3 style={styles.cardTitle}>{a.program_title}</h3>
                <p style={styles.cardSub}>
                  {a.program_country ?? '—'} · submitted {new Date(a.submitted_at).toLocaleDateString()}
                  {a.decision_at && ` · decided ${new Date(a.decision_at).toLocaleDateString()}`}
                </p>
                {a.decision_notes && <p style={styles.notes}>“{a.decision_notes}”</p>}
              </div>
              <span style={{ ...styles.badge, background: statusColors[a.status] }}>
                {a.status.replace('_', ' ')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: '900px', margin: '0 auto', padding: '2rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  title: { fontSize: '1.75rem', fontWeight: 700 },
  backBtn: { padding: '0.5rem 1rem', background: '#e2e8f0', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  section: { background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', marginBottom: '1.25rem' },
  sectionTitle: { fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem' },
  card: { padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '10px', marginBottom: '0.75rem', background: '#fafafa' },
  appCard: { padding: '0.875rem 1rem', border: '1px solid #e2e8f0', borderRadius: '10px', marginBottom: '0.5rem' },
  cardHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' },
  cardTitle: { fontSize: '1.05rem', fontWeight: 700 },
  cardSub: { color: '#64748b', fontSize: '0.825rem', marginTop: '0.125rem' },
  desc: { color: '#374151', fontSize: '0.875rem', marginTop: '0.5rem' },
  notes: { color: '#475569', fontSize: '0.825rem', fontStyle: 'italic', marginTop: '0.375rem' },
  cardActions: { display: 'flex', gap: '0.5rem', marginTop: '0.75rem' },
  applyBtn: { padding: '0.5rem 1.25rem', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600 },
  appliedBadge: { padding: '4px 12px', background: '#dcfce7', color: '#166534', fontSize: '0.7rem', fontWeight: 700, borderRadius: '12px' },
  badge: { padding: '4px 12px', borderRadius: '12px', color: '#fff', fontSize: '0.7rem', fontWeight: 700 },
  toast: { padding: '0.75rem 1rem', background: '#dcfce7', color: '#166534', borderRadius: '8px', marginBottom: '1rem', fontWeight: 500 },
  empty: { color: '#94a3b8', fontStyle: 'italic' },
  dim: { color: '#64748b' },
  error: { color: '#dc2626' },
}

export default ExternalProgramsPage
