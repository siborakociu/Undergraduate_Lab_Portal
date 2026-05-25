import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import apiClient from '../api/apiClient'
import { applicationApi } from '../api/applicationApi'
import type { ApplicantOut, ApplicationStatus, DocumentOut } from '../types'

const statusColors: Record<ApplicationStatus, string> = {
  SUBMITTED: '#2563eb',
  UNDER_REVIEW: '#d97706',
  ACCEPTED: '#059669',
  REJECTED: '#dc2626',
  WITHDRAWN: '#64748b',
}

const ApplicantDetailPage: React.FC = () => {
  const { applicationId } = useParams<{ applicationId: string }>()
  const navigate = useNavigate()
  const [applicant, setApplicant] = useState<ApplicantOut | null>(null)
  const [isLoading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [docs, setDocs] = useState<DocumentOut[]>([])

  const load = async () => {
    if (!applicationId) return
    setLoading(true)
    setError(null)
    try {
      const res = await applicationApi.getApplicant(applicationId)
      setApplicant(res.data)
      setNotes(res.data.decision_notes ?? '')
      try {
        const docRes = await apiClient.get<DocumentOut[]>(`/documents/student/${res.data.student_profile_id}`)
        setDocs(docRes.data)
      } catch {
        setDocs([])
      }
    } catch {
      setError('Failed to load applicant')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [applicationId])

  const decide = async (status: ApplicationStatus) => {
    if (!applicationId) return
    setSaving(true)
    setError(null)
    try {
      await applicationApi.updateStatus(applicationId, { status, decision_notes: notes || undefined })
      setToast(`Application marked ${status.replace('_', ' ')}`)
      await load()
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Failed to update status')
    } finally {
      setSaving(false)
      setTimeout(() => setToast(null), 2500)
    }
  }

  if (isLoading) return <div style={styles.page}><p>Loading…</p></div>
  if (!applicant) return (
    <div style={styles.page}>
      <p style={styles.error}>{error ?? 'Applicant not found'}</p>
      <button style={styles.backBtn} onClick={() => navigate(-1)}>Back</button>
    </div>
  )

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>{applicant.full_name || applicant.username}</h1>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>Back</button>
      </div>

      {toast && <div style={styles.toast}>{toast}</div>}
      {error && <p style={styles.error}>{error}</p>}

      <div style={styles.grid}>
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Profile</h2>
          <Row label="Username" value={applicant.username} />
          <Row label="Email" value={applicant.email} />
          <Row label="Full Name" value={applicant.full_name || '—'} />
          <Row label="Major" value={applicant.major || '—'} />
          <Row label="GPA" value={applicant.gpa != null ? String(applicant.gpa) : '—'} />
          <div style={{ marginTop: '0.75rem' }}>
            <p style={styles.rowLabel}>Skills</p>
            {applicant.skills.length === 0 ? <p style={styles.rowValue}>—</p> : (
              <div style={styles.skills}>
                {applicant.skills.map((s) => <span key={s} style={styles.skillPill}>{s}</span>)}
              </div>
            )}
          </div>
          <div style={{ marginTop: '1rem' }}>
            <p style={styles.rowLabel}>Documents ({docs.length})</p>
            {docs.length === 0 ? (
              <p style={styles.rowValue}>No documents uploaded.</p>
            ) : (
              <ul style={styles.docList}>
                {docs.map((d) => (
                  <li key={d.id} style={styles.docItem}>
                    {d.file_name}
                    {d.uploaded_at && (
                      <span style={styles.docDate}> · {new Date(d.uploaded_at).toLocaleDateString()}</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Application</h2>
          <Row label="Position" value={applicant.position_title} />
          <Row label="Submitted" value={new Date(applicant.submitted_at).toLocaleString()} />
          <div style={{ marginTop: '0.75rem' }}>
            <p style={styles.rowLabel}>Status</p>
            <span style={{ ...styles.statusBadge, background: statusColors[applicant.status] }}>
              {applicant.status.replace('_', ' ')}
            </span>
          </div>
          {applicant.decision_at && (
            <Row label="Decided" value={new Date(applicant.decision_at).toLocaleString()} />
          )}

          <label style={{ ...styles.rowLabel, marginTop: '1rem' }}>Decision notes (optional)</label>
          <textarea
            style={styles.notes}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Feedback that will be visible to the student"
          />

          <div style={styles.actions}>
            <button style={{ ...styles.actionBtn, background: '#d97706' }} disabled={saving} onClick={() => decide('UNDER_REVIEW')}>
              Mark Under Review
            </button>
            <button style={{ ...styles.actionBtn, background: '#dc2626' }} disabled={saving} onClick={() => decide('REJECTED')}>
              Reject
            </button>
            <button style={{ ...styles.actionBtn, background: '#059669' }} disabled={saving} onClick={() => decide('ACCEPTED')}>
              Accept
            </button>
          </div>

          {applicant.status === 'ACCEPTED' && (
            <p style={styles.info}>Student was added to the position's lab automatically.</p>
          )}
        </div>
      </div>
    </div>
  )
}

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div style={styles.row}>
    <span style={styles.rowLabel}>{label}</span>
    <span style={styles.rowValue}>{value}</span>
  </div>
)

const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: '1000px', margin: '0 auto', padding: '2rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  title: { fontSize: '1.75rem', fontWeight: 700 },
  backBtn: { padding: '0.5rem 1rem', background: '#e2e8f0', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' },
  section: { background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' },
  sectionTitle: { fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' },
  row: { display: 'flex', justifyContent: 'space-between', padding: '0.375rem 0', borderBottom: '1px solid #f1f5f9' },
  rowLabel: { fontWeight: 600, fontSize: '0.825rem', color: '#374151' },
  rowValue: { color: '#64748b', fontSize: '0.875rem' },
  skills: { display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginTop: '0.5rem' },
  skillPill: { padding: '3px 10px', background: '#eff6ff', color: '#1e40af', fontSize: '0.75rem', borderRadius: '8px' },
  docList: { listStyle: 'none', padding: 0, marginTop: '0.5rem' },
  docItem: { padding: '0.375rem 0', fontSize: '0.875rem', color: '#374151', borderBottom: '1px solid #f1f5f9' },
  docDate: { fontSize: '0.75rem', color: '#94a3b8' },
  statusBadge: { display: 'inline-block', padding: '3px 10px', borderRadius: '12px', color: '#fff', fontSize: '0.75rem', fontWeight: 700, marginTop: '0.25rem' },
  notes: { width: '100%', minHeight: '80px', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '8px', fontFamily: 'inherit', fontSize: '0.875rem', marginTop: '0.375rem', resize: 'vertical', boxSizing: 'border-box' },
  actions: { display: 'flex', gap: '0.5rem', marginTop: '1rem' },
  actionBtn: { padding: '0.5rem 0.875rem', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', flex: 1, fontSize: '0.875rem' },
  toast: { padding: '0.75rem 1rem', background: '#dcfce7', color: '#166534', borderRadius: '8px', marginBottom: '1rem', fontWeight: 500 },
  error: { color: '#dc2626' },
  info: { color: '#059669', fontSize: '0.825rem', marginTop: '0.75rem', textAlign: 'center' },
}

export default ApplicantDetailPage
