import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { applicationApi } from '../api/applicationApi'
import { labApi } from '../api/labApi'
import { useLabRoster } from '../hooks/useLabRoster'
import type { ApplicantOut, LabOut, LabStatus, PositionOut } from '../types'

const statusColor: Record<LabStatus, string> = {
  ACTIVE: '#059669',
  INACTIVE: '#64748b',
  SUSPENDED: '#dc2626',
}

const positionStatusColor: Record<string, string> = {
  OPEN: '#059669',
  CLOSED: '#64748b',
  FILLED: '#7c3aed',
}

const LabManagementPage: React.FC = () => {
  const navigate = useNavigate()
  const [labs, setLabs] = useState<LabOut[]>([])
  const [selectedLabId, setSelectedLabId] = useState<string | null>(null)
  const [loadingLabs, setLoadingLabs] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [positions, setPositions] = useState<PositionOut[]>([])
  const [applicants, setApplicants] = useState<ApplicantOut[]>([])
  const [loadingPositions, setLoadingPositions] = useState(false)

  const { roster, addMember, removeMember, isLoading: loadingRoster, error: rosterError } = useLabRoster(selectedLabId ?? undefined)

  const [showCreate, setShowCreate] = useState(false)
  const [newLab, setNewLab] = useState({ name: '', department: '' })

  const [editMode, setEditMode] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', department: '' })
  const [saveError, setSaveError] = useState<string | null>(null)

  const [username, setUsername] = useState('')
  const [role, setRole] = useState('Research Assistant')
  const [adding, setAdding] = useState(false)

  const selectedLab = useMemo(
    () => labs.find((l) => l.id === selectedLabId) ?? null,
    [labs, selectedLabId],
  )

  const loadLabs = async () => {
    setLoadingLabs(true)
    setLoadError(null)
    try {
      const res = await labApi.getMine()
      setLabs(res.data)
      if (res.data.length > 0 && !selectedLabId) {
        setSelectedLabId(res.data[0].id)
      }
    } catch {
      setLoadError('Failed to load your labs')
    } finally {
      setLoadingLabs(false)
    }
  }

  useEffect(() => { loadLabs() }, [])

  useEffect(() => {
    if (!selectedLabId) {
      setPositions([])
      setApplicants([])
      return
    }
    setLoadingPositions(true)
    Promise.all([
      labApi.getPositions(selectedLabId),
      applicationApi.getForProfessor(),
    ])
      .then(([posRes, appRes]) => {
        setPositions(posRes.data)
        setApplicants(appRes.data)
      })
      .catch(() => {})
      .finally(() => setLoadingPositions(false))
  }, [selectedLabId])

  useEffect(() => {
    if (selectedLab) {
      setEditForm({
        name: selectedLab.name,
        department: selectedLab.department ?? '',
      })
    }
  }, [selectedLab])

  const handleCreateLab = async () => {
    if (!newLab.name.trim()) return
    const res = await labApi.create({
      name: newLab.name.trim(),
      department: newLab.department.trim() || null,
    })
    setLabs((prev) => [...prev, res.data])
    setSelectedLabId(res.data.id)
    setNewLab({ name: '', department: '' })
    setShowCreate(false)
  }

  const handleSaveLab = async () => {
    if (!selectedLab) return
    if (!editForm.name.trim()) {
      setSaveError('Lab name is required')
      return
    }
    setSaveError(null)
    try {
      const res = await labApi.update(selectedLab.id, {
        name: editForm.name.trim(),
        department: editForm.department.trim() || null,
      })
      setLabs((prev) => prev.map((l) => (l.id === res.data.id ? res.data : l)))
      setEditMode(false)
    } catch (err: unknown) {
      const e = err as { response?: { status?: number; data?: { detail?: unknown } }; message?: string }
      const detail = e?.response?.data?.detail
      if (typeof detail === 'string') {
        setSaveError(detail)
      } else {
        setSaveError(`Failed to save lab (status ${e?.response?.status ?? '?'})`)
      }
    }
  }

  const changeStatus = async (status: LabStatus) => {
    if (!selectedLab) return
    await labApi.updateStatus(selectedLab.id, status)
    setLabs((prev) => prev.map((l) => (l.id === selectedLab.id ? { ...l, status } : l)))
  }

  const handleAddMember = async () => {
    if (!username.trim() || !role.trim()) return
    setAdding(true)
    try {
      await addMember({ username: username.trim(), role: role.trim() })
      setUsername('')
    } catch { /* error in hook */ }
    finally { setAdding(false) }
  }

  const acceptedByPosition = useMemo(() => {
    const map: Record<string, ApplicantOut[]> = {}
    for (const a of applicants) {
      if (a.status !== 'ACCEPTED') continue
      if (!map[a.position_id]) map[a.position_id] = []
      map[a.position_id].push(a)
    }
    return map
  }, [applicants])

  const certInfo = (lab: LabOut) => {
    const prefix = lab.cert_type ? `${lab.cert_type}: ` : 'Cert: '
    if (!lab.cert_expiry) return { label: `${prefix}NOT SET`, bg: '#fef9c3', color: '#854d0e' }
    const expired = new Date(lab.cert_expiry) < new Date()
    const dateStr = new Date(lab.cert_expiry).toLocaleDateString()
    return expired
      ? { label: `${prefix}EXPIRED (${dateStr})`, bg: '#fee2e2', color: '#991b1b' }
      : { label: `${prefix}VALID until ${dateStr}`, bg: '#dcfce7', color: '#166534' }
  }

  if (loadingLabs) return <div style={styles.page}><p>Loading labs…</p></div>

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Lab Management</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button style={styles.backBtn} onClick={() => navigate('/dashboard')}>Back</button>
          <button style={styles.primaryBtn} onClick={() => setShowCreate(!showCreate)}>
            {showCreate ? 'Cancel' : '+ New Lab'}
          </button>
        </div>
      </div>

      {loadError && <p style={styles.error}>{loadError}</p>}

      {showCreate && (
        <div style={styles.createCard}>
          <h3 style={styles.sectionTitle}>Create New Lab</h3>
          <p style={styles.hint}>Certification (type + expiry) is set by the administrator after creation.</p>
          <div style={styles.formRow}>
            <input
              style={styles.input}
              placeholder="Lab name (e.g. AI Research Group)"
              value={newLab.name}
              onChange={(e) => setNewLab({ ...newLab, name: e.target.value })}
            />
            <input
              style={styles.input}
              placeholder="Department"
              value={newLab.department}
              onChange={(e) => setNewLab({ ...newLab, department: e.target.value })}
            />
            <button style={styles.primaryBtn} onClick={handleCreateLab}>Create</button>
          </div>
        </div>
      )}

      {labs.length === 0 && !showCreate && (
        <div style={styles.empty}>
          <p>You don't have any labs yet.</p>
          <button style={styles.primaryBtn} onClick={() => setShowCreate(true)}>Create your first lab</button>
        </div>
      )}

      {labs.length > 0 && (
        <>
          <div style={styles.labGrid}>
            {labs.map((lab) => {
              const isSelected = lab.id === selectedLabId
              return (
                <div
                  key={lab.id}
                  style={{
                    ...styles.labChip,
                    border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                    background: isSelected ? '#eff6ff' : '#fff',
                  }}
                  onClick={() => setSelectedLabId(lab.id)}
                >
                  <div style={styles.labChipHead}>
                    <strong>{lab.name}</strong>
                    <span style={{ ...styles.statusBadge, background: statusColor[lab.status] }}>{lab.status}</span>
                  </div>
                  <p style={styles.labChipSub}>{lab.department ?? 'No department'}</p>
                </div>
              )
            })}
          </div>

          {selectedLab && (
            <>
              <div style={styles.labCard}>
                <div style={styles.labHead}>
                  {editMode ? (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <input style={styles.input} value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} placeholder="Lab name" />
                      <input style={styles.input} value={editForm.department} onChange={(e) => setEditForm({ ...editForm, department: e.target.value })} placeholder="Department" />
                      <p style={styles.hint}>Certification is set by the administrator.</p>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button style={styles.primaryBtn} onClick={handleSaveLab}>Save</button>
                        <button style={styles.backBtn} onClick={() => { setEditMode(false); setSaveError(null) }}>Cancel</button>
                      </div>
                      {saveError && <p style={styles.error}>{saveError}</p>}
                    </div>
                  ) : (
                    <>
                      <div>
                        <h2 style={styles.labName}>{selectedLab.name}</h2>
                        <p style={styles.labSub}>{selectedLab.department ?? 'No department'}</p>
                      </div>
                      <div style={styles.labRight}>
                        <span style={{ ...styles.statusBadge, background: statusColor[selectedLab.status] }}>{selectedLab.status}</span>
                        {(() => {
                          const c = certInfo(selectedLab)
                          return <span style={{ ...styles.certBadge, background: c.bg, color: c.color }}>{c.label}</span>
                        })()}
                        <button style={styles.editBtn} onClick={() => setEditMode(true)}>Edit</button>
                      </div>
                    </>
                  )}
                </div>

                {!editMode && (
                  <div style={styles.statsRow}>
                    <div style={styles.stat}><strong>{positions.length}</strong><span> positions</span></div>
                    <div style={styles.stat}><strong>{positions.filter((p) => p.status === 'OPEN').length}</strong><span> open</span></div>
                    <div style={styles.stat}><strong>{roster.length}</strong><span> members</span></div>
                  </div>
                )}

                {!editMode && (
                  <div style={styles.statusRow}>
                    <label style={styles.label}>Lab Status:</label>
                    <select style={styles.select} value={selectedLab.status} onChange={(e) => changeStatus(e.target.value as LabStatus)}>
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                      <option value="SUSPENDED">Suspended</option>
                    </select>
                  </div>
                )}
              </div>

              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Positions in this lab</h3>
                {loadingPositions && <p style={styles.info}>Loading…</p>}
                {!loadingPositions && positions.length === 0 && (
                  <p style={styles.empty2}>
                    No positions in this lab yet. <button style={styles.linkBtn} onClick={() => navigate('/positions/new')}>Create one</button>
                  </p>
                )}
                {positions.map((p) => {
                  const accepted = acceptedByPosition[p.id] ?? []
                  return (
                    <div key={p.id} style={styles.positionCard}>
                      <div style={styles.posHead}>
                        <div>
                          <h4 style={styles.posTitle}>{p.title}</h4>
                          <p style={styles.posMeta}>
                            {p.department ?? '—'} {p.required_gpa != null && `· Min GPA ${p.required_gpa}`}
                          </p>
                        </div>
                        <span style={{ ...styles.statusBadge, background: positionStatusColor[p.status] }}>{p.status}</span>
                      </div>
                      <div style={styles.acceptedHeader}>
                        Accepted students ({accepted.length})
                      </div>
                      {accepted.length === 0 && (
                        <p style={styles.dim}>No one accepted yet.</p>
                      )}
                      {accepted.map((a) => (
                        <div key={a.application_id} style={styles.studentRow} onClick={() => navigate(`/applicants/${a.application_id}`)}>
                          <div>
                            <p style={styles.studentName}>{a.full_name || a.username}</p>
                            <p style={styles.studentMeta}>
                              @{a.username} · {a.email} {a.gpa != null && `· GPA ${a.gpa}`} {a.major && `· ${a.major}`}
                            </p>
                            {a.skills.length > 0 && (
                              <div style={styles.skillRow}>
                                {a.skills.slice(0, 5).map((s) => <span key={s} style={styles.skillPill}>{s}</span>)}
                              </div>
                            )}
                          </div>
                          <span style={styles.viewLink}>View →</span>
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>

              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Add Member Manually</h3>
                <p style={styles.hint}>Add a student directly by username (they must have a completed profile). Accepting an application also adds them automatically.</p>
                <div style={styles.formRow}>
                  <input style={styles.input} placeholder="Student username" value={username} onChange={(e) => setUsername(e.target.value)} />
                  <input style={styles.input} placeholder="Role" value={role} onChange={(e) => setRole(e.target.value)} />
                  <button style={styles.addBtn} disabled={adding} onClick={handleAddMember}>{adding ? 'Adding…' : 'Add'}</button>
                </div>
                {rosterError && <p style={styles.error}>{rosterError}</p>}
              </div>

              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Roster ({roster.length})</h3>
                {loadingRoster && <p style={styles.info}>Loading…</p>}
                {!loadingRoster && roster.length === 0 && <p style={styles.empty2}>No members yet.</p>}
                {roster.map((m) => (
                  <div key={m.id} style={styles.memberRow}>
                    <div>
                      <p style={styles.studentName}>{m.full_name || m.username}</p>
                      <p style={styles.studentMeta}>
                        @{m.username} · {m.email}
                      </p>
                      <p style={styles.memberRole}>
                        {m.role ?? 'Member'} {m.joined_at && `· joined ${new Date(m.joined_at).toLocaleDateString()}`}
                      </p>
                    </div>
                    <button style={styles.removeBtn} onClick={() => removeMember(m.id)}>Remove</button>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: '1000px', margin: '0 auto', padding: '2rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  title: { fontSize: '1.75rem', fontWeight: 700 },
  backBtn: { padding: '0.5rem 1rem', background: '#e2e8f0', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  primaryBtn: { padding: '0.5rem 1rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 },
  editBtn: { padding: '4px 12px', background: '#e2e8f0', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' },
  labGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' },
  labChip: { padding: '0.875rem 1rem', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.1s' },
  labChipHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' },
  labChipSub: { color: '#64748b', fontSize: '0.8rem', marginTop: '0.25rem' },
  createCard: { background: '#fff', padding: '1.25rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', marginBottom: '1rem' },
  labCard: { background: '#fff', padding: '1.25rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', marginBottom: '1rem' },
  labHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' },
  labName: { fontSize: '1.25rem', fontWeight: 700 },
  labSub: { color: '#64748b', marginTop: '0.25rem' },
  labRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.375rem' },
  statusBadge: { padding: '4px 12px', borderRadius: '12px', color: '#fff', fontSize: '0.7rem', fontWeight: 700 },
  certBadge: { padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 },
  statsRow: { display: 'flex', gap: '1.5rem', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' },
  stat: { fontSize: '0.875rem', color: '#374151' },
  statusRow: { display: 'flex', alignItems: 'center', gap: '0.625rem', marginTop: '1rem' },
  label: { fontWeight: 500, fontSize: '0.875rem' },
  select: { padding: '0.4rem 0.625rem', borderRadius: '6px', border: '1px solid #d1d5db' },
  section: { background: '#fff', padding: '1.25rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', marginBottom: '1rem' },
  sectionTitle: { fontWeight: 700, marginBottom: '0.5rem', fontSize: '1.05rem' },
  hint: { color: '#64748b', fontSize: '0.825rem', marginBottom: '0.75rem' },
  formRow: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
  input: { padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.875rem', flex: 1, minWidth: '160px' },
  addBtn: { padding: '0.5rem 1rem', background: '#059669', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 },
  positionCard: { padding: '0.875rem 1rem', border: '1px solid #e2e8f0', borderRadius: '10px', marginBottom: '0.75rem', background: '#fafafa' },
  posHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' },
  posTitle: { fontSize: '1rem', fontWeight: 700 },
  posMeta: { color: '#64748b', fontSize: '0.8rem', marginTop: '0.125rem' },
  acceptedHeader: { fontSize: '0.825rem', fontWeight: 600, color: '#374151', marginTop: '0.5rem', marginBottom: '0.25rem' },
  studentRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.625rem', background: '#fff', borderRadius: '8px', marginTop: '0.375rem', cursor: 'pointer', border: '1px solid #f1f5f9' },
  studentName: { fontWeight: 600, fontSize: '0.9rem' },
  studentMeta: { color: '#64748b', fontSize: '0.78rem', marginTop: '0.125rem' },
  memberRole: { color: '#374151', fontSize: '0.8rem', marginTop: '0.125rem' },
  skillRow: { display: 'flex', gap: '0.25rem', flexWrap: 'wrap', marginTop: '0.375rem' },
  skillPill: { padding: '2px 8px', background: '#eff6ff', color: '#1e40af', fontSize: '0.7rem', borderRadius: '8px' },
  viewLink: { color: '#2563eb', fontSize: '0.825rem', fontWeight: 600 },
  memberRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.625rem 0', borderBottom: '1px solid #f1f5f9' },
  removeBtn: { padding: '4px 12px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' },
  empty: { textAlign: 'center', padding: '3rem', color: '#64748b', background: '#fff', borderRadius: '12px' },
  empty2: { color: '#94a3b8' },
  dim: { color: '#94a3b8', fontSize: '0.825rem' },
  info: { color: '#64748b' },
  error: { color: '#dc2626' },
  linkBtn: { background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', textDecoration: 'underline', padding: 0, fontSize: 'inherit' },
}

export default LabManagementPage
