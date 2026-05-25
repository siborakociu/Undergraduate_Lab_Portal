import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fundingApi } from '../api/fundingApi'
import { labApi } from '../api/labApi'
import type { FundingRequestOut, FundingStatus, LabOut } from '../types'

const statusColor: Record<FundingStatus, string> = {
  PENDING: '#d97706',
  APPROVED: '#059669',
  REJECTED: '#dc2626',
}

const FundingRequestsPage: React.FC = () => {
  const navigate = useNavigate()
  const [labs, setLabs] = useState<LabOut[]>([])
  const [requests, setRequests] = useState<FundingRequestOut[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const [form, setForm] = useState({ lab_id: '', amount: '', purpose: '' })

  const load = async () => {
    setLoading(true)
    try {
      const [labsRes, reqRes] = await Promise.all([
        labApi.getMine(),
        fundingApi.getMine(),
      ])
      setLabs(labsRes.data)
      setRequests(reqRes.data)
      if (labsRes.data.length > 0 && !form.lab_id) {
        setForm((f) => ({ ...f, lab_id: labsRes.data[0].id }))
      }
    } catch {
      setError('Failed to load funding data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!form.lab_id) {
      setError('Pick a lab')
      return
    }
    const amount = parseFloat(form.amount)
    if (isNaN(amount) || amount <= 0) {
      setError('Amount must be greater than 0')
      return
    }
    if (!form.purpose.trim()) {
      setError('Reason is required')
      return
    }
    setSubmitting(true)
    try {
      await fundingApi.submitRequest({
        lab_id: form.lab_id,
        amount,
        purpose: form.purpose.trim(),
      })
      setForm({ lab_id: form.lab_id, amount: '', purpose: '' })
      setToast('Funding request submitted')
      await load()
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Failed to submit request')
    } finally {
      setSubmitting(false)
      setTimeout(() => setToast(null), 2500)
    }
  }

  const labName = (id: string | null) => labs.find((l) => l.id === id)?.name ?? '—'

  if (loading) return <div style={styles.page}><p>Loading…</p></div>

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Funding Requests</h1>
        <button style={styles.backBtn} onClick={() => navigate('/dashboard')}>Back</button>
      </div>

      {toast && <div style={styles.toast}>{toast}</div>}

      {labs.length === 0 ? (
        <div style={styles.emptyCard}>
          <p>You need to create a lab before you can request funding.</p>
          <button style={styles.primaryBtn} onClick={() => navigate('/lab')}>Go to Lab Management</button>
        </div>
      ) : (
        <>
          <form style={styles.form} onSubmit={handleSubmit}>
            <h3 style={styles.sectionTitle}>New Request</h3>

            <label style={styles.label}>Lab</label>
            <select
              style={styles.input}
              value={form.lab_id}
              onChange={(e) => setForm({ ...form, lab_id: e.target.value })}
              required
            >
              {labs.map((lab) => (
                <option key={lab.id} value={lab.id}>
                  {lab.name} {lab.department ? `(${lab.department})` : ''}
                </option>
              ))}
            </select>

            <label style={styles.label}>Amount (USD)</label>
            <input
              style={styles.input}
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g. 5000"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              required
            />

            <label style={styles.label}>Reason</label>
            <textarea
              style={{ ...styles.input, minHeight: '120px', resize: 'vertical' }}
              placeholder="What will the funding be used for?"
              value={form.purpose}
              onChange={(e) => setForm({ ...form, purpose: e.target.value })}
              required
            />

            {error && <p style={styles.error}>{error}</p>}

            <button style={styles.primaryBtn} type="submit" disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit Request'}
            </button>
          </form>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>My Requests ({requests.length})</h3>
            {requests.length === 0 && <p style={styles.empty}>No requests yet.</p>}
            {requests.map((req) => (
              <div key={req.id} style={styles.reqCard}>
                <div style={styles.reqHead}>
                  <div>
                    <p style={styles.amount}>${Number(req.amount).toFixed(2)}</p>
                    <p style={styles.reqMeta}>
                      Lab: {labName(req.lab_id)}
                      {req.submitted_at && ` · submitted ${new Date(req.submitted_at).toLocaleDateString()}`}
                    </p>
                  </div>
                  <span style={{ ...styles.statusBadge, background: statusColor[req.status] }}>
                    {req.status}
                  </span>
                </div>
                {req.purpose && <p style={styles.purpose}>{req.purpose}</p>}
                {req.reviewed_at && (
                  <p style={styles.reviewed}>Reviewed {new Date(req.reviewed_at).toLocaleDateString()}</p>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: '800px', margin: '0 auto', padding: '2rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  title: { fontSize: '1.75rem', fontWeight: 700 },
  backBtn: { padding: '0.5rem 1rem', background: '#e2e8f0', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  form: { background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' },
  section: { background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' },
  sectionTitle: { fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.75rem' },
  label: { fontWeight: 500, fontSize: '0.875rem', color: '#374151', marginTop: '0.5rem' },
  input: { padding: '0.625rem 0.875rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.95rem', fontFamily: 'inherit' },
  primaryBtn: { marginTop: '1rem', padding: '0.75rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' },
  reqCard: { padding: '0.875rem 1rem', border: '1px solid #e2e8f0', borderRadius: '10px', marginBottom: '0.5rem' },
  reqHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  amount: { fontSize: '1.05rem', fontWeight: 700 },
  reqMeta: { color: '#64748b', fontSize: '0.825rem', marginTop: '0.125rem' },
  purpose: { color: '#374151', fontSize: '0.875rem', marginTop: '0.5rem' },
  reviewed: { color: '#94a3b8', fontSize: '0.75rem', marginTop: '0.375rem' },
  statusBadge: { padding: '4px 12px', borderRadius: '12px', color: '#fff', fontSize: '0.75rem', fontWeight: 700 },
  emptyCard: { background: '#fff', padding: '2rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', textAlign: 'center' },
  empty: { color: '#94a3b8' },
  toast: { padding: '0.75rem 1rem', background: '#dcfce7', color: '#166534', borderRadius: '8px', marginBottom: '1rem', fontWeight: 500 },
  error: { color: '#dc2626', fontSize: '0.875rem', marginTop: '0.5rem' },
}

export default FundingRequestsPage
