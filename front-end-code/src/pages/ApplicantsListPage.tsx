import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { applicationApi } from '../api/applicationApi'
import type { ApplicantOut, ApplicationStatus } from '../types'

const statusColors: Record<ApplicationStatus, string> = {
  SUBMITTED: '#2563eb',
  UNDER_REVIEW: '#d97706',
  ACCEPTED: '#059669',
  REJECTED: '#dc2626',
  WITHDRAWN: '#64748b',
}

const STATUSES: ApplicationStatus[] = ['SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED', 'WITHDRAWN']

interface Props {
  scope?: 'history' | 'position'
}

const ApplicantsListPage: React.FC<Props> = ({ scope = 'history' }) => {
  const navigate = useNavigate()
  const { positionId } = useParams<{ positionId: string }>()
  const [applicants, setApplicants] = useState<ApplicantOut[]>([])
  const [isLoading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [query, setQuery] = useState('')
  const [minGpa, setMinGpa] = useState('')
  const [statusFilter, setStatusFilter] = useState<'' | ApplicationStatus>('')
  const [skill, setSkill] = useState('')

  useEffect(() => {
    setLoading(true)
    setError(null)
    applicationApi.getForProfessor()
      .then((res) => setApplicants(res.data))
      .catch(() => setError('Failed to load applicants'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const gpaThreshold = minGpa ? parseFloat(minGpa) : null
    const skillTerm = skill.trim().toLowerCase()
    return applicants.filter((a) => {
      if (scope === 'position' && positionId && a.position_id !== positionId) return false
      if (statusFilter && a.status !== statusFilter) return false
      if (gpaThreshold != null && (a.gpa == null || a.gpa < gpaThreshold)) return false
      if (skillTerm && !a.skills.some((s) => s.toLowerCase().includes(skillTerm))) return false
      if (q) {
        const hay = [a.full_name, a.username, a.email, a.major ?? '', a.skills.join(' ')]
          .join(' ').toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [applicants, query, minGpa, statusFilter, skill, scope, positionId])

  const positionTitle = scope === 'position'
    ? applicants.find((a) => a.position_id === positionId)?.position_title
    : null

  const clearFilters = () => {
    setQuery('')
    setMinGpa('')
    setStatusFilter('')
    setSkill('')
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>
            {scope === 'position' ? 'Applicants' : 'Applicant History'}
          </h1>
          {positionTitle && <p style={styles.subtitle}>Position: <strong>{positionTitle}</strong></p>}
        </div>
        <button
          style={styles.backBtn}
          onClick={() => navigate(scope === 'position' ? '/positions/mine' : '/dashboard')}
        >
          Back
        </button>
      </div>

      <div style={styles.filters}>
        <input
          style={styles.input}
          placeholder="Search name, email, skills…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <input
          style={{ ...styles.input, maxWidth: '140px' }}
          type="number"
          step="0.1"
          min="0"
          max="4"
          placeholder="Min GPA"
          value={minGpa}
          onChange={(e) => setMinGpa(e.target.value)}
        />
        <input
          style={{ ...styles.input, maxWidth: '160px' }}
          placeholder="Skill contains…"
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
        />
        <select
          style={{ ...styles.input, maxWidth: '180px' }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as '' | ApplicationStatus)}
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
        <button style={styles.clearBtn} onClick={clearFilters}>Clear</button>
      </div>

      {error && <p style={styles.error}>{error}</p>}
      {isLoading && <p style={styles.info}>Loading…</p>}
      {!isLoading && filtered.length === 0 && (
        <p style={styles.empty}>
          {applicants.length === 0 ? 'No applicants yet.' : 'No results match your filters.'}
        </p>
      )}

      <div style={styles.list}>
        {filtered.map((a) => (
          <div
            key={a.application_id}
            style={styles.card}
            onClick={() => navigate(`/applicants/${a.application_id}`)}
          >
            <div style={styles.cardLeft}>
              <h3 style={styles.applicantName}>{a.full_name || a.username}</h3>
              <p style={styles.applicantSub}>
                {a.username} · {a.email}
              </p>
              <p style={styles.applicantMeta}>
                {a.major ?? 'No major'} {a.gpa != null && `· GPA ${a.gpa}`}
              </p>
              {a.skills.length > 0 && (
                <div style={styles.skillRow}>
                  {a.skills.slice(0, 5).map((s) => (
                    <span key={s} style={styles.skillPill}>{s}</span>
                  ))}
                  {a.skills.length > 5 && <span style={styles.skillMore}>+{a.skills.length - 5} more</span>}
                </div>
              )}
            </div>
            <div style={styles.cardRight}>
              <span style={{ ...styles.statusBadge, background: statusColors[a.status] }}>
                {a.status.replace('_', ' ')}
              </span>
              <p style={styles.posTitle}>{a.position_title}</p>
              <p style={styles.submitted}>{new Date(a.submitted_at).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: '1100px', margin: '0 auto', padding: '2rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  title: { fontSize: '1.75rem', fontWeight: 700 },
  subtitle: { color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' },
  backBtn: { padding: '0.5rem 1rem', background: '#e2e8f0', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  filters: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem', background: '#fff', padding: '0.75rem', borderRadius: '10px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' },
  input: { padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.875rem', flex: 1, minWidth: '180px' },
  clearBtn: { padding: '0.5rem 1rem', background: '#e2e8f0', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  list: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  card: { display: 'flex', justifyContent: 'space-between', gap: '1rem', background: '#fff', padding: '1rem 1.25rem', borderRadius: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.06)', cursor: 'pointer', transition: 'transform 0.1s' },
  cardLeft: { flex: 1 },
  applicantName: { fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.125rem' },
  applicantSub: { color: '#64748b', fontSize: '0.825rem' },
  applicantMeta: { color: '#374151', fontSize: '0.85rem', marginTop: '0.375rem' },
  skillRow: { display: 'flex', gap: '0.375rem', flexWrap: 'wrap', marginTop: '0.5rem' },
  skillPill: { padding: '2px 8px', background: '#eff6ff', color: '#1e40af', fontSize: '0.7rem', borderRadius: '8px' },
  skillMore: { padding: '2px 8px', color: '#64748b', fontSize: '0.7rem' },
  cardRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.375rem', minWidth: '180px' },
  statusBadge: { padding: '3px 10px', borderRadius: '12px', color: '#fff', fontSize: '0.75rem', fontWeight: 700 },
  posTitle: { fontSize: '0.825rem', color: '#374151', fontWeight: 500, textAlign: 'right' },
  submitted: { fontSize: '0.75rem', color: '#94a3b8' },
  empty: { textAlign: 'center', padding: '2rem', color: '#94a3b8' },
  error: { color: '#dc2626' },
  info: { color: '#64748b' },
}

export default ApplicantsListPage
