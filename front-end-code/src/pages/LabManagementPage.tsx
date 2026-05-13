import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { labApi } from '../api/labApi'
import { useLabRoster } from '../hooks/useLabRoster'
import type { LabOut } from '../types'

const LabManagementPage: React.FC = () => {
  const navigate = useNavigate()
  const [labId, setLabId] = useState('')
  const [inputLabId, setInputLabId] = useState('')
  const [labInfo, setLabInfo] = useState<LabOut | null>(null)
  const { roster, addMember, removeMember, isLoading } = useLabRoster(labId)
  const [newStudentId, setNewStudentId] = useState('')
  const [newRole, setNewRole] = useState('')

  const loadLab = async () => {
    try {
      const res = await labApi.getLab(inputLabId)
      setLabInfo(res.data)
      setLabId(inputLabId)
    } catch {
      alert('Lab not found')
    }
  }

  const handleAdd = async () => {
    if (!newStudentId || !newRole) return
    await addMember({ student_id: newStudentId, role: newRole })
    setNewStudentId('')
    setNewRole('')
  }

  const certStatus = labInfo?.cert_expiry
    ? new Date(labInfo.cert_expiry) < new Date()
      ? 'EXPIRED'
      : 'VALID'
    : 'UNKNOWN'

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Lab Management</h1>
        <button style={styles.backBtn} onClick={() => navigate('/dashboard')}>Back</button>
      </div>

      <div style={styles.searchBar}>
        <input
          style={styles.input}
          placeholder="Enter Lab ID"
          value={inputLabId}
          onChange={(e) => setInputLabId(e.target.value)}
        />
        <button style={styles.searchBtn} onClick={loadLab}>Load Lab</button>
      </div>

      {labInfo && (
        <>
          <div style={styles.labCard}>
            <h2 style={styles.labName}>{labInfo.name}</h2>
            <p style={styles.labSub}>{labInfo.department} &mdash; {labInfo.status}</p>
            <span style={{
              ...styles.certBadge,
              background: certStatus === 'VALID' ? '#dcfce7' : certStatus === 'EXPIRED' ? '#fee2e2' : '#fef9c3',
              color: certStatus === 'VALID' ? '#166534' : certStatus === 'EXPIRED' ? '#991b1b' : '#854d0e',
            }}>
              Cert: {certStatus} {labInfo.cert_expiry ? `(${new Date(labInfo.cert_expiry).toLocaleDateString()})` : ''}
            </span>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Add Member</h3>
            <div style={styles.addRow}>
              <input
                style={styles.input}
                placeholder="Student ID"
                value={newStudentId}
                onChange={(e) => setNewStudentId(e.target.value)}
              />
              <input
                style={styles.input}
                placeholder="Role (e.g. Research Assistant)"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
              />
              <button style={styles.addBtn} onClick={handleAdd}>Add</button>
            </div>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Roster ({roster.length})</h3>
            {isLoading && <p style={styles.info}>Loading roster…</p>}
            {roster.map((m) => (
              <div key={m.id} style={styles.memberRow}>
                <div>
                  <p style={styles.memberId}>{m.student_id.slice(0, 8)}…</p>
                  <p style={styles.memberRole}>{m.role}</p>
                </div>
                <button style={styles.removeBtn} onClick={() => removeMember(m.id)}>Remove</button>
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
  searchBar: { display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' },
  input: { padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.9rem', flex: 1 },
  searchBtn: { padding: '0.5rem 1rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  labCard: { background: '#fff', padding: '1.25rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', marginBottom: '1.5rem' },
  labName: { fontSize: '1.2rem', fontWeight: 700 },
  labSub: { color: '#64748b', margin: '0.25rem 0' },
  certBadge: { display: 'inline-block', padding: '3px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 },
  section: { background: '#fff', padding: '1.25rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', marginBottom: '1rem' },
  sectionTitle: { fontWeight: 600, marginBottom: '0.75rem' },
  addRow: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap' },
  addBtn: { padding: '0.5rem 1rem', background: '#059669', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  memberRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.625rem 0', borderBottom: '1px solid #f1f5f9' },
  memberId: { fontWeight: 500 },
  memberRole: { color: '#64748b', fontSize: '0.875rem' },
  removeBtn: { padding: '4px 10px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' },
  info: { color: '#64748b' },
}

export default LabManagementPage
