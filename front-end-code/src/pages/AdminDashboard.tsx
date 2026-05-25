import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { adminApi } from '../api/adminApi'
import { fundingApi } from '../api/fundingApi'
import { labApi } from '../api/labApi'
import { stipendApi } from '../api/stipendApi'
import type {
  AdminLabOut,
  AdminStatsOut,
  FundingRequestDetailOut,
  FundingStatus,
  LabStatus,
  StipendDetailOut,
  StipendStatus,
} from '../types'

type TabKey = 'overview' | 'compliance' | 'funding' | 'reports'

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: 'overview', label: 'Research Overview' },
  { key: 'compliance', label: 'Lab Compliance' },
  { key: 'funding', label: 'Funding & Stipends' },
  { key: 'reports', label: 'Reports' },
]

const fundingStatusColor: Record<FundingStatus, string> = {
  PENDING: '#d97706',
  APPROVED: '#059669',
  REJECTED: '#dc2626',
}

const labStatusColor: Record<LabStatus, string> = {
  ACTIVE: '#059669',
  INACTIVE: '#64748b',
  SUSPENDED: '#dc2626',
}

const certStateStyle: Record<string, { bg: string; color: string }> = {
  VALID: { bg: '#dcfce7', color: '#166534' },
  EXPIRED: { bg: '#fee2e2', color: '#991b1b' },
  UNKNOWN: { bg: '#fef9c3', color: '#854d0e' },
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const urlTab = (searchParams.get('tab') as TabKey) || 'overview'
  const [tab, setTab] = useState<TabKey>(urlTab)

  useEffect(() => { setTab(urlTab) }, [urlTab])

  const switchTab = (k: TabKey) => {
    setTab(k)
    setSearchParams({ tab: k })
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Admin Panel</h1>
        <button style={styles.backBtn} onClick={() => navigate('/dashboard')}>Back</button>
      </div>

      <div style={styles.tabRow}>
        {TABS.map((t) => (
          <button
            key={t.key}
            style={{
              ...styles.tabBtn,
              background: tab === t.key ? '#2563eb' : '#fff',
              color: tab === t.key ? '#fff' : '#374151',
              borderColor: tab === t.key ? '#2563eb' : '#e2e8f0',
            }}
            onClick={() => switchTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && <OverviewTab />}
      {tab === 'compliance' && <ComplianceTab />}
      {tab === 'funding' && <FundingTab />}
      {tab === 'reports' && <ReportsTab />}
    </div>
  )
}

// ---------- Overview ----------
const OverviewTab: React.FC = () => {
  const [stats, setStats] = useState<AdminStatsOut | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi.getStats()
      .then((r) => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p style={styles.dim}>Loading…</p>
  if (!stats) return <p style={styles.error}>Failed to load stats</p>

  const cards: Array<{ label: string; value: string | number; tone?: string }> = [
    { label: 'Professors', value: stats.professors },
    { label: 'Students', value: stats.students },
    { label: 'Labs', value: stats.labs },
    { label: 'Active Labs', value: stats.active_labs, tone: '#059669' },
    { label: 'Suspended Labs', value: stats.suspended_labs, tone: stats.suspended_labs > 0 ? '#dc2626' : undefined },
    { label: 'Expired Certs', value: stats.expired_certs, tone: stats.expired_certs > 0 ? '#dc2626' : undefined },
    { label: 'Positions', value: stats.positions },
    { label: 'Open Positions', value: stats.open_positions, tone: '#2563eb' },
    { label: 'Applications', value: stats.applications },
    { label: 'Accepted', value: stats.accepted_applications, tone: '#059669' },
    { label: 'Pending Funding', value: stats.pending_funding, tone: stats.pending_funding > 0 ? '#d97706' : undefined },
    { label: 'Approved Funding', value: `$${stats.approved_funding_amount.toFixed(2)}`, tone: '#059669' },
  ]

  return (
    <div style={styles.statsGrid}>
      {cards.map((c) => (
        <div key={c.label} style={styles.statCard}>
          <p style={styles.statLabel}>{c.label}</p>
          <p style={{ ...styles.statValue, color: c.tone ?? '#0f172a' }}>{c.value}</p>
        </div>
      ))}
    </div>
  )
}

// ---------- Compliance ----------
const ComplianceTab: React.FC = () => {
  const [labs, setLabs] = useState<AdminLabOut[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'EXPIRED' | 'SUSPENDED'>('ALL')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [certForm, setCertForm] = useState({ cert_type: '', cert_expiry: '' })

  const load = async () => {
    setLoading(true)
    try {
      const r = await adminApi.getAllLabs()
      setLabs(r.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const flagLab = async (id: string, status: LabStatus) => {
    await labApi.updateStatus(id, status)
    setLabs((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)))
  }

  const startCertEdit = (lab: AdminLabOut) => {
    setEditingId(lab.id)
    setCertForm({
      cert_type: lab.cert_type ?? '',
      cert_expiry: lab.cert_expiry ? lab.cert_expiry.slice(0, 10) : '',
    })
  }

  const saveCert = async (labId: string) => {
    await adminApi.setLabCertification(labId, {
      cert_type: certForm.cert_type.trim() || null,
      cert_expiry: certForm.cert_expiry ? new Date(certForm.cert_expiry + 'T00:00:00').toISOString() : null,
    })
    setEditingId(null)
    await load()
  }

  const filtered = useMemo(() => {
    if (filter === 'EXPIRED') return labs.filter((l) => l.cert_state === 'EXPIRED')
    if (filter === 'SUSPENDED') return labs.filter((l) => l.status === 'SUSPENDED')
    return labs
  }, [labs, filter])

  return (
    <div>
      <div style={styles.filterRow}>
        {(['ALL', 'EXPIRED', 'SUSPENDED'] as const).map((s) => (
          <button
            key={s}
            style={{
              ...styles.filterBtn,
              background: filter === s ? '#2563eb' : '#e2e8f0',
              color: filter === s ? '#fff' : '#374151',
            }}
            onClick={() => setFilter(s)}
          >
            {s === 'ALL' ? 'All Labs' : s === 'EXPIRED' ? 'Expired Certs' : 'Suspended'}
          </button>
        ))}
      </div>

      {loading && <p style={styles.dim}>Loading…</p>}
      {!loading && filtered.length === 0 && <p style={styles.empty}>No labs match the filter.</p>}

      {filtered.map((lab) => {
        const cert = certStateStyle[lab.cert_state]
        const isEditing = editingId === lab.id
        return (
          <div key={lab.id} style={styles.labCard}>
            <div style={styles.labHead}>
              <div style={{ flex: 1 }}>
                <h3 style={styles.labName}>{lab.name}</h3>
                <p style={styles.labMeta}>{lab.department ?? 'No department'}</p>
                <p style={styles.labMeta}>
                  Owner: {lab.professor_username ? `@${lab.professor_username} · ${lab.professor_email}` : '—'}
                </p>
                <p style={styles.labMeta}>
                  Members: <strong>{lab.member_count}</strong> · Positions: <strong>{lab.position_count}</strong>
                </p>
                {lab.cert_type && <p style={styles.labMeta}>Cert type: <strong>{lab.cert_type}</strong></p>}
              </div>
              <div style={styles.badges}>
                <span style={{ ...styles.badge, background: labStatusColor[lab.status] }}>{lab.status}</span>
                <span style={{ ...styles.certBadge, background: cert.bg, color: cert.color }}>
                  {lab.cert_state}
                  {lab.cert_expiry && ` (${new Date(lab.cert_expiry).toLocaleDateString()})`}
                </span>
              </div>
            </div>

            {isEditing && (
              <div style={styles.certForm}>
                <label style={styles.label}>Certification type</label>
                <input
                  style={styles.input}
                  placeholder="e.g. Biosafety Level 2, Chemical Hygiene"
                  value={certForm.cert_type}
                  onChange={(e) => setCertForm({ ...certForm, cert_type: e.target.value })}
                />
                <label style={styles.label}>Expiry date</label>
                <input
                  style={styles.input}
                  type="date"
                  value={certForm.cert_expiry}
                  onChange={(e) => setCertForm({ ...certForm, cert_expiry: e.target.value })}
                />
                <div style={styles.labActions}>
                  <button style={styles.reactivateBtn} onClick={() => saveCert(lab.id)}>Save Certification</button>
                  <button style={styles.cancelBtn} onClick={() => setEditingId(null)}>Cancel</button>
                </div>
              </div>
            )}

            {!isEditing && (
              <div style={styles.labActions}>
                <button style={styles.editCertBtn} onClick={() => startCertEdit(lab)}>
                  Set Certification
                </button>
                {lab.status !== 'SUSPENDED' && (
                  <button style={styles.flagBtn} onClick={() => flagLab(lab.id, 'SUSPENDED')}>
                    Suspend (Flag)
                  </button>
                )}
                {lab.status === 'SUSPENDED' && (
                  <button style={styles.reactivateBtn} onClick={() => flagLab(lab.id, 'ACTIVE')}>
                    Reactivate
                  </button>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

const stipendStatusColor: Record<StipendStatus, string> = {
  PENDING: '#d97706',
  APPROVED: '#059669',
  PROCESSED: '#2563eb',
  REJECTED: '#dc2626',
}

// ---------- Funding & Stipends ----------
const FundingTab: React.FC = () => {
  const [funding, setFunding] = useState<FundingRequestDetailOut[]>([])
  const [stipends, setStipends] = useState<StipendDetailOut[]>([])
  const [fundingFilter, setFundingFilter] = useState<FundingStatus | 'ALL'>('PENDING')
  const [stipendFilter, setStipendFilter] = useState<StipendStatus | 'ALL'>('PENDING')
  const [loadingFunding, setLoadingFunding] = useState(true)
  const [loadingStipends, setLoadingStipends] = useState(true)

  const loadFunding = async (status: FundingStatus | 'ALL') => {
    setLoadingFunding(true)
    try {
      const r = await fundingApi.getAllRequests(status === 'ALL' ? undefined : status)
      setFunding(r.data)
    } finally {
      setLoadingFunding(false)
    }
  }

  const loadStipends = async (status: StipendStatus | 'ALL') => {
    setLoadingStipends(true)
    try {
      const r = await stipendApi.getAll(status === 'ALL' ? undefined : status)
      setStipends(r.data)
    } finally {
      setLoadingStipends(false)
    }
  }

  useEffect(() => { loadFunding(fundingFilter) }, [fundingFilter])
  useEffect(() => { loadStipends(stipendFilter) }, [stipendFilter])

  const decideFunding = async (id: string, decision: 'APPROVED' | 'REJECTED') => {
    await fundingApi.recordDecision(id, { decision })
    await loadFunding(fundingFilter)
  }

  const processStipend = async (id: string, status: StipendStatus) => {
    await stipendApi.processStipend(id, { status })
    await loadStipends(stipendFilter)
  }

  const totalApproved = useMemo(
    () => funding.filter((r) => r.status === 'APPROVED').reduce((s, r) => s + Number(r.amount), 0),
    [funding],
  )

  return (
    <div>
      <div style={styles.subTitle}>Funding Requests</div>
      <p style={styles.dim}>General funding requests submitted by professors.</p>
      <div style={styles.filterRow}>
        {(['PENDING', 'APPROVED', 'REJECTED', 'ALL'] as const).map((s) => (
          <button
            key={s}
            style={{
              ...styles.filterBtn,
              background: fundingFilter === s ? '#2563eb' : '#e2e8f0',
              color: fundingFilter === s ? '#fff' : '#374151',
            }}
            onClick={() => setFundingFilter(s)}
          >
            {s}
          </button>
        ))}
      </div>

      {fundingFilter === 'APPROVED' && (
        <p style={styles.totalLine}>Total approved: <strong>${totalApproved.toFixed(2)}</strong></p>
      )}

      {loadingFunding && <p style={styles.dim}>Loading…</p>}
      {!loadingFunding && funding.length === 0 && <p style={styles.empty}>No requests in this view.</p>}

      {funding.map((req) => (
        <div key={req.id} style={styles.reqCard}>
          <div style={styles.reqHead}>
            <div style={{ flex: 1 }}>
              <p style={styles.amount}>${Number(req.amount).toFixed(2)}</p>
              <p style={styles.reqLine}>
                <strong>Lab:</strong> {req.lab_name ?? '—'}
                {req.lab_department && ` (${req.lab_department})`}
              </p>
              <p style={styles.reqLine}>
                <strong>Professor:</strong> @{req.professor_username} · {req.professor_email}
              </p>
              {req.submitted_at && <p style={styles.dim}>Submitted {new Date(req.submitted_at).toLocaleString()}</p>}
              {req.reviewed_at && <p style={styles.dim}>Reviewed {new Date(req.reviewed_at).toLocaleString()}</p>}
            </div>
            <span style={{ ...styles.badge, background: fundingStatusColor[req.status] }}>{req.status}</span>
          </div>
          {req.purpose && (
            <div style={styles.purposeBox}>
              <p style={styles.purposeLabel}>Reason</p>
              <p style={styles.purposeText}>{req.purpose}</p>
            </div>
          )}
          {req.status === 'PENDING' && (
            <div style={styles.actions}>
              <button style={styles.approveBtn} onClick={() => decideFunding(req.id, 'APPROVED')}>Approve</button>
              <button style={styles.rejectBtn} onClick={() => decideFunding(req.id, 'REJECTED')}>Reject</button>
            </div>
          )}
        </div>
      ))}

      <div style={{ ...styles.subTitle, marginTop: '2rem' }}>Stipends</div>
      <p style={styles.dim}>Stipend funding automatically generated when professors create positions.</p>
      <div style={styles.filterRow}>
        {(['PENDING', 'APPROVED', 'PROCESSED', 'REJECTED', 'ALL'] as const).map((s) => (
          <button
            key={s}
            style={{
              ...styles.filterBtn,
              background: stipendFilter === s ? '#2563eb' : '#e2e8f0',
              color: stipendFilter === s ? '#fff' : '#374151',
            }}
            onClick={() => setStipendFilter(s)}
          >
            {s}
          </button>
        ))}
      </div>

      {loadingStipends && <p style={styles.dim}>Loading…</p>}
      {!loadingStipends && stipends.length === 0 && <p style={styles.empty}>No stipends in this view.</p>}

      {stipends.map((s) => (
        <div key={s.id} style={styles.reqCard}>
          <div style={styles.reqHead}>
            <div style={{ flex: 1 }}>
              <p style={styles.amount}>${Number(s.amount).toFixed(2)}</p>
              {s.position_title && (
                <p style={styles.reqLine}><strong>Position:</strong> {s.position_title}</p>
              )}
              <p style={styles.reqLine}>
                <strong>Lab:</strong> {s.lab_name ?? '—'}
                {s.lab_department && ` (${s.lab_department})`}
              </p>
              {s.professor_username && (
                <p style={styles.reqLine}>
                  <strong>Professor:</strong> @{s.professor_username} · {s.professor_email}
                </p>
              )}
              {s.submitted_at && <p style={styles.dim}>Submitted {new Date(s.submitted_at).toLocaleString()}</p>}
              {s.processed_at && <p style={styles.dim}>Processed {new Date(s.processed_at).toLocaleString()}</p>}
            </div>
            <span style={{ ...styles.badge, background: stipendStatusColor[s.status] }}>{s.status}</span>
          </div>
          {s.purpose && (
            <div style={styles.purposeBox}>
              <p style={styles.purposeLabel}>Reason</p>
              <p style={styles.purposeText}>{s.purpose}</p>
            </div>
          )}
          {s.status === 'PENDING' && (
            <div style={styles.actions}>
              <button style={styles.approveBtn} onClick={() => processStipend(s.id, 'APPROVED')}>Approve</button>
              <button style={styles.rejectBtn} onClick={() => processStipend(s.id, 'REJECTED')}>Reject</button>
            </div>
          )}
          {s.status === 'APPROVED' && (
            <div style={styles.actions}>
              <button style={styles.processBtn} onClick={() => processStipend(s.id, 'PROCESSED')}>Mark Processed</button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ---------- Reports ----------
const ReportsTab: React.FC = () => {
  const [stats, setStats] = useState<AdminStatsOut | null>(null)
  const [labs, setLabs] = useState<AdminLabOut[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([adminApi.getStats(), adminApi.getAllLabs()])
      .then(([s, l]) => {
        setStats(s.data)
        setLabs(l.data)
      })
      .finally(() => setLoading(false))
  }, [])

  const downloadCsv = () => {
    if (!labs.length) return
    const headers = ['Lab', 'Department', 'Owner', 'Status', 'Cert State', 'Cert Expiry', 'Members', 'Positions']
    const rows = labs.map((l) => [
      l.name,
      l.department ?? '',
      l.professor_username ?? '',
      l.status,
      l.cert_state,
      l.cert_expiry ? new Date(l.cert_expiry).toLocaleDateString() : '',
      String(l.member_count),
      String(l.position_count),
    ])
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lab-report-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) return <p style={styles.dim}>Loading…</p>

  return (
    <div>
      <div style={styles.section}>
        <h3 style={styles.subTitle}>Institutional Report</h3>
        {stats && (
          <ul style={styles.reportList}>
            <li><strong>Total professors:</strong> {stats.professors}</li>
            <li><strong>Total students:</strong> {stats.students}</li>
            <li><strong>Total labs:</strong> {stats.labs} ({stats.active_labs} active, {stats.suspended_labs} suspended)</li>
            <li><strong>Labs with expired certifications:</strong> {stats.expired_certs}</li>
            <li><strong>Positions:</strong> {stats.positions} ({stats.open_positions} open)</li>
            <li><strong>Applications:</strong> {stats.applications} ({stats.accepted_applications} accepted)</li>
            <li><strong>Approved funding total:</strong> ${stats.approved_funding_amount.toFixed(2)}</li>
            <li><strong>Pending funding requests:</strong> {stats.pending_funding}</li>
          </ul>
        )}
        <button style={styles.primaryBtn} onClick={() => window.print()}>Print Report</button>
        <button style={{ ...styles.primaryBtn, marginLeft: '0.5rem', background: '#059669' }} onClick={downloadCsv}>
          Download Lab CSV
        </button>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: '1100px', margin: '0 auto', padding: '2rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  title: { fontSize: '1.75rem', fontWeight: 700 },
  backBtn: { padding: '0.5rem 1rem', background: '#e2e8f0', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  tabRow: { display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' },
  tabBtn: { padding: '0.5rem 1rem', border: '1px solid', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem' },
  statCard: { background: '#fff', padding: '1rem', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' },
  statLabel: { fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 },
  statValue: { fontSize: '1.5rem', fontWeight: 700, marginTop: '0.25rem' },
  filterRow: { display: 'flex', gap: '0.375rem', flexWrap: 'wrap', marginBottom: '1rem' },
  filterBtn: { padding: '4px 12px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 },
  labCard: { background: '#fff', padding: '1rem', borderRadius: '10px', marginBottom: '0.75rem', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' },
  labHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' },
  labName: { fontSize: '1.05rem', fontWeight: 700 },
  labMeta: { color: '#64748b', fontSize: '0.825rem', marginTop: '0.125rem' },
  badges: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.375rem' },
  badge: { padding: '4px 12px', borderRadius: '12px', color: '#fff', fontSize: '0.7rem', fontWeight: 700 },
  certBadge: { padding: '3px 10px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 600 },
  labActions: { display: 'flex', gap: '0.5rem', marginTop: '0.75rem' },
  flagBtn: { padding: '6px 14px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 },
  reactivateBtn: { padding: '6px 14px', background: '#059669', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 },
  editCertBtn: { padding: '6px 14px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 },
  cancelBtn: { padding: '6px 14px', background: '#e2e8f0', color: '#374151', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 },
  certForm: { display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem', padding: '0.875rem', background: '#f8fafc', borderRadius: '8px' },
  label: { fontWeight: 500, fontSize: '0.825rem', color: '#374151' },
  input: { padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.875rem' },
  subTitle: { fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem' },
  totalLine: { color: '#374151', marginBottom: '0.75rem' },
  reqCard: { background: '#fff', padding: '1rem', borderRadius: '10px', marginBottom: '0.75rem', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' },
  reqHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' },
  amount: { fontSize: '1.25rem', fontWeight: 700 },
  reqLine: { fontSize: '0.875rem', color: '#374151', marginTop: '0.25rem' },
  dim: { fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.125rem' },
  purposeBox: { marginTop: '0.625rem', padding: '0.5rem 0.75rem', background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '8px' },
  purposeLabel: { fontSize: '0.7rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' },
  purposeText: { fontSize: '0.875rem', color: '#374151', marginTop: '0.125rem' },
  actions: { display: 'flex', gap: '0.5rem', marginTop: '0.5rem' },
  approveBtn: { padding: '6px 14px', background: '#059669', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 },
  processBtn: { padding: '6px 14px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 },
  rejectBtn: { padding: '6px 14px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 },
  section: { background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' },
  reportList: { lineHeight: '1.8', marginBottom: '1rem', paddingLeft: '1.25rem' },
  primaryBtn: { padding: '0.6rem 1.25rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' },
  empty: { color: '#94a3b8', fontStyle: 'italic' },
  error: { color: '#dc2626' },
}

export default AdminDashboard
