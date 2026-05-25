import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { programApi } from '../api/programApi'
import type {
  ApplicationStatus,
  ProgramApplicantOut,
  ProgramOut,
  ProgramStatus,
} from '../types'

type TabKey = 'programs' | 'applicants'

const statusColors: Record<ApplicationStatus, string> = {
  SUBMITTED: '#2563eb',
  UNDER_REVIEW: '#d97706',
  ACCEPTED: '#059669',
  REJECTED: '#dc2626',
  WITHDRAWN: '#64748b',
}

const programStatusColors: Record<ProgramStatus, string> = {
  DRAFT: '#64748b',
  PUBLISHED: '#059669',
  CLOSED: '#dc2626',
}

const APP_STATUSES: ApplicationStatus[] = ['SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED', 'WITHDRAWN']

const HRProgramsPage: React.FC = () => {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const urlTab = (params.get('tab') as TabKey) || 'programs'
  const [tab, setTab] = useState<TabKey>(urlTab)
  useEffect(() => { setTab(urlTab) }, [urlTab])
  const switchTab = (t: TabKey) => { setTab(t); setParams({ tab: t }) }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>External Programs</h1>
        <button style={styles.backBtn} onClick={() => navigate('/dashboard')}>Back</button>
      </div>
      <div style={styles.tabRow}>
        <button
          style={{ ...styles.tabBtn, background: tab === 'programs' ? '#2563eb' : '#fff', color: tab === 'programs' ? '#fff' : '#374151' }}
          onClick={() => switchTab('programs')}
        >
          My Programs
        </button>
        <button
          style={{ ...styles.tabBtn, background: tab === 'applicants' ? '#2563eb' : '#fff', color: tab === 'applicants' ? '#fff' : '#374151' }}
          onClick={() => switchTab('applicants')}
        >
          Applicants
        </button>
      </div>

      {tab === 'programs' && <ProgramsTab />}
      {tab === 'applicants' && <ApplicantsTab />}
    </div>
  )
}

const ProgramsTab: React.FC = () => {
  const [programs, setPrograms] = useState<ProgramOut[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ title: '', country: '', deadline: '', description: '', required_gpa: '' })
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const r = await programApi.getMine()
      setPrograms(r.data)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const resetForm = () => {
    setForm({ title: '', country: '', deadline: '', description: '', required_gpa: '' })
    setEditingId(null)
    setShowForm(false)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!form.title.trim()) {
      setError('Title is required')
      return
    }
    const gpa = form.required_gpa ? parseFloat(form.required_gpa) : null
    if (gpa !== null && (isNaN(gpa) || gpa < 0 || gpa > 4)) {
      setError('GPA must be between 0 and 4')
      return
    }
    setSaving(true)
    try {
      const payload = {
        title: form.title.trim(),
        country: form.country.trim() || null,
        deadline: form.deadline ? new Date(form.deadline + 'T00:00:00').toISOString() : null,
        description: form.description.trim() || null,
        required_gpa: gpa,
      }
      if (editingId) {
        await programApi.updateProgram(editingId, payload)
      } else {
        await programApi.publishProgram(payload)
      }
      resetForm()
      await load()
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Failed to save program')
    } finally {
      setSaving(false)
    }
  }

  const startEdit = (p: ProgramOut) => {
    setEditingId(p.id)
    setForm({
      title: p.title,
      country: p.country ?? '',
      deadline: p.deadline ? p.deadline.slice(0, 10) : '',
      description: p.description ?? '',
      required_gpa: p.required_gpa != null ? String(p.required_gpa) : '',
    })
    setShowForm(true)
  }

  const setStatus = async (id: string, status: ProgramStatus) => {
    await programApi.updateProgram(id, { status })
    setPrograms((prev) => prev.map((p) => p.id === id ? { ...p, status } : p))
  }

  return (
    <div>
      <div style={styles.actionsRow}>
        <button style={styles.primaryBtn} onClick={() => { resetForm(); setShowForm(true) }}>
          + New Program
        </button>
      </div>

      {showForm && (
        <form style={styles.form} onSubmit={handleSubmit}>
          <h3 style={styles.subTitle}>{editingId ? 'Edit Program' : 'New Program'}</h3>
          <label style={styles.label}>Name</label>
          <input style={styles.input} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <label style={styles.label}>Description</label>
          <textarea style={{ ...styles.input, minHeight: '100px', resize: 'vertical' }} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What the program offers, eligibility, etc." />
          <label style={styles.label}>Required GPA</label>
          <input style={styles.input} type="number" step="0.1" min="0" max="4" value={form.required_gpa} onChange={(e) => setForm({ ...form, required_gpa: e.target.value })} placeholder="e.g. 3.0 (optional)" />
          <label style={styles.label}>Country</label>
          <input style={styles.input} value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} placeholder="(optional)" />
          <label style={styles.label}>Deadline</label>
          <input style={styles.input} type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
          {error && <p style={styles.error}>{error}</p>}
          <div style={styles.formActions}>
            <button style={styles.primaryBtn} type="submit" disabled={saving}>{saving ? 'Saving…' : (editingId ? 'Save' : 'Publish')}</button>
            <button style={styles.cancelBtn} type="button" onClick={resetForm}>Cancel</button>
          </div>
        </form>
      )}

      {loading && <p style={styles.dim}>Loading…</p>}
      {!loading && programs.length === 0 && (
        <p style={styles.empty}>You haven't created any programs yet.</p>
      )}

      {programs.map((p) => (
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
            <span style={{ ...styles.badge, background: programStatusColors[p.status] }}>{p.status}</span>
          </div>
          {p.description && <p style={styles.desc}>{p.description}</p>}
          <div style={styles.cardActions}>
            <select style={styles.select} value={p.status} onChange={(e) => setStatus(p.id, e.target.value as ProgramStatus)}>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="CLOSED">Closed</option>
            </select>
            <button style={styles.editBtn} onClick={() => startEdit(p)}>Edit</button>
          </div>
        </div>
      ))}
    </div>
  )
}

const ApplicantsTab: React.FC = () => {
  const navigate = useNavigate()
  const [applicants, setApplicants] = useState<ProgramApplicantOut[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [minGpa, setMinGpa] = useState('')
  const [statusFilter, setStatusFilter] = useState<'' | ApplicationStatus>('')
  const [savingId, setSavingId] = useState<string | null>(null)
  const [notesMap, setNotesMap] = useState<Record<string, string>>({})

  const load = async () => {
    setLoading(true)
    try {
      const r = await programApi.getAllApplicants()
      setApplicants(r.data)
      const notes: Record<string, string> = {}
      r.data.forEach((a) => { notes[a.application_id] = a.decision_notes ?? '' })
      setNotesMap(notes)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const decide = async (appId: string, status: ApplicationStatus) => {
    setSavingId(appId)
    try {
      await programApi.updateApplicationStatus(appId, status, notesMap[appId] || undefined)
      await load()
    } finally { setSavingId(null) }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const gpa = minGpa ? parseFloat(minGpa) : null
    return applicants.filter((a) => {
      if (statusFilter && a.status !== statusFilter) return false
      if (gpa != null && (a.gpa == null || a.gpa < gpa)) return false
      if (q) {
        const hay = [a.full_name, a.username, a.email, a.major ?? '', a.program_title, a.skills.join(' ')].join(' ').toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [applicants, query, minGpa, statusFilter])

  const downloadCsv = () => {
    if (!filtered.length) return
    const headers = ['Program', 'Student', 'Username', 'Email', 'Major', 'GPA', 'Status', 'Submitted', 'Decision', 'Notes']
    const rows = filtered.map((a) => [
      a.program_title,
      a.full_name,
      a.username,
      a.email,
      a.major ?? '',
      a.gpa != null ? String(a.gpa) : '',
      a.status,
      new Date(a.submitted_at).toLocaleDateString(),
      a.decision_at ? new Date(a.decision_at).toLocaleDateString() : '',
      a.decision_notes ?? '',
    ])
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${(c || '').replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `program-applicants-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div style={styles.filters}>
        <input style={styles.input} placeholder="Search name, email, program…" value={query} onChange={(e) => setQuery(e.target.value)} />
        <input style={{ ...styles.input, maxWidth: '140px' }} type="number" step="0.1" min="0" max="4" placeholder="Min GPA" value={minGpa} onChange={(e) => setMinGpa(e.target.value)} />
        <select style={{ ...styles.input, maxWidth: '180px' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as '' | ApplicationStatus)}>
          <option value="">All statuses</option>
          {APP_STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
        <button style={styles.exportBtn} onClick={downloadCsv} disabled={filtered.length === 0}>Download CSV</button>
      </div>

      {loading && <p style={styles.dim}>Loading…</p>}
      {!loading && filtered.length === 0 && <p style={styles.empty}>No applicants match.</p>}

      {filtered.map((a) => (
        <div key={a.application_id} style={styles.card}>
          <div style={styles.cardHead}>
            <div style={{ flex: 1 }}>
              <h3 style={styles.cardTitle}>{a.full_name || a.username}</h3>
              <p style={styles.cardSub}>@{a.username} · {a.email}</p>
              <p style={styles.cardSub}>
                {a.major ?? 'No major'} {a.gpa != null && `· GPA ${a.gpa}`}
              </p>
              <p style={styles.cardSub}><strong>Program:</strong> {a.program_title}</p>
              {a.skills.length > 0 && (
                <div style={styles.skillRow}>
                  {a.skills.slice(0, 6).map((s) => <span key={s} style={styles.skillPill}>{s}</span>)}
                </div>
              )}
            </div>
            <span style={{ ...styles.badge, background: statusColors[a.status] }}>{a.status.replace('_', ' ')}</span>
          </div>
          <textarea
            style={{ ...styles.input, minHeight: '60px', resize: 'vertical', marginTop: '0.75rem' }}
            placeholder="Decision notes (optional)"
            value={notesMap[a.application_id] ?? ''}
            onChange={(e) => setNotesMap({ ...notesMap, [a.application_id]: e.target.value })}
          />
          <div style={styles.cardActions}>
            <button style={styles.reviewBtn} disabled={savingId === a.application_id} onClick={() => decide(a.application_id, 'UNDER_REVIEW')}>Mark Reviewing</button>
            <button style={styles.acceptBtn} disabled={savingId === a.application_id} onClick={() => decide(a.application_id, 'ACCEPTED')}>Accept</button>
            <button style={styles.rejectBtn} disabled={savingId === a.application_id} onClick={() => decide(a.application_id, 'REJECTED')}>Reject</button>
          </div>
        </div>
      ))}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: '1000px', margin: '0 auto', padding: '2rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  title: { fontSize: '1.75rem', fontWeight: 700 },
  backBtn: { padding: '0.5rem 1rem', background: '#e2e8f0', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  tabRow: { display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' },
  tabBtn: { padding: '0.5rem 1rem', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' },
  actionsRow: { marginBottom: '1rem' },
  primaryBtn: { padding: '0.5rem 1rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 },
  cancelBtn: { padding: '0.5rem 1rem', background: '#e2e8f0', color: '#374151', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  form: { background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' },
  subTitle: { fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.5rem' },
  label: { fontWeight: 500, fontSize: '0.875rem', color: '#374151', marginTop: '0.5rem' },
  input: { padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.875rem', fontFamily: 'inherit', flex: 1 },
  formActions: { display: 'flex', gap: '0.5rem', marginTop: '0.75rem' },
  card: { background: '#fff', padding: '1.25rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', marginBottom: '0.75rem' },
  cardHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' },
  cardTitle: { fontSize: '1.05rem', fontWeight: 700 },
  cardSub: { color: '#64748b', fontSize: '0.825rem', marginTop: '0.125rem' },
  desc: { color: '#374151', fontSize: '0.875rem', marginTop: '0.75rem' },
  badge: { padding: '4px 12px', borderRadius: '12px', color: '#fff', fontSize: '0.7rem', fontWeight: 700 },
  cardActions: { display: 'flex', gap: '0.5rem', marginTop: '0.75rem', alignItems: 'center', flexWrap: 'wrap' },
  select: { padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.875rem' },
  editBtn: { padding: '0.4rem 0.75rem', background: '#e2e8f0', color: '#374151', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.825rem', fontWeight: 600 },
  reviewBtn: { padding: '6px 14px', background: '#d97706', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.825rem', fontWeight: 600 },
  acceptBtn: { padding: '6px 14px', background: '#059669', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.825rem', fontWeight: 600 },
  rejectBtn: { padding: '6px 14px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.825rem', fontWeight: 600 },
  filters: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem', background: '#fff', padding: '0.75rem', borderRadius: '10px' },
  skillRow: { display: 'flex', gap: '0.25rem', flexWrap: 'wrap', marginTop: '0.375rem' },
  skillPill: { padding: '2px 8px', background: '#eff6ff', color: '#1e40af', fontSize: '0.7rem', borderRadius: '8px' },
  empty: { color: '#94a3b8', fontStyle: 'italic' },
  dim: { color: '#64748b' },
  error: { color: '#dc2626', fontSize: '0.875rem' },
  exportBtn: { padding: '0.5rem 1rem', background: '#059669', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 },
}

export default HRProgramsPage
