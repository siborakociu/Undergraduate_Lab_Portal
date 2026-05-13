import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fundingApi } from '../api/fundingApi'
import { stipendApi } from '../api/stipendApi'
import type { FundingRequestOut, StipendOut } from '../types'

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate()
  const [fundingRequests, setFundingRequests] = useState<FundingRequestOut[]>([])
  const [stipends, setStipends] = useState<StipendOut[]>([])

  useEffect(() => {
    fundingApi.getPendingRequests().then((r) => setFundingRequests(r.data)).catch(() => {})
    stipendApi.getPendingStipends().then((r) => setStipends(r.data)).catch(() => {})
  }, [])

  const decideFunding = async (id: string, decision: 'APPROVED' | 'REJECTED') => {
    await fundingApi.recordDecision(id, { decision })
    setFundingRequests((prev) => prev.filter((r) => r.id !== id))
  }

  const processStipend = async (id: string, status: 'APPROVED' | 'REJECTED' | 'PROCESSED') => {
    await stipendApi.processStipend(id, { status })
    setStipends((prev) => prev.filter((s) => s.id !== id))
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Admin Dashboard</h1>
        <button style={styles.backBtn} onClick={() => navigate('/dashboard')}>Back</button>
      </div>

      <div style={styles.grid}>
        <div style={styles.panel}>
          <h2 style={styles.panelTitle}>Funding Requests ({fundingRequests.length})</h2>
          {fundingRequests.length === 0 && <p style={styles.empty}>No pending requests</p>}
          {fundingRequests.map((req) => (
            <div key={req.id} style={styles.item}>
              <div style={styles.itemInfo}>
                <p style={styles.itemTitle}>${Number(req.amount).toFixed(2)}</p>
                <p style={styles.itemSub}>{req.purpose}</p>
              </div>
              <div style={styles.actions}>
                <button style={styles.approveBtn} onClick={() => decideFunding(req.id, 'APPROVED')}>Approve</button>
                <button style={styles.rejectBtn} onClick={() => decideFunding(req.id, 'REJECTED')}>Reject</button>
              </div>
            </div>
          ))}
        </div>

        <div style={styles.panel}>
          <h2 style={styles.panelTitle}>Pending Stipends ({stipends.length})</h2>
          {stipends.length === 0 && <p style={styles.empty}>No pending stipends</p>}
          {stipends.map((s) => (
            <div key={s.id} style={styles.item}>
              <div style={styles.itemInfo}>
                <p style={styles.itemTitle}>${Number(s.amount).toFixed(2)}</p>
                <p style={styles.itemSub}>Student: {s.student_id.slice(0, 8)}…</p>
              </div>
              <div style={styles.actions}>
                <button style={styles.approveBtn} onClick={() => processStipend(s.id, 'APPROVED')}>Approve</button>
                <button style={styles.processBtn} onClick={() => processStipend(s.id, 'PROCESSED')}>Process</button>
                <button style={styles.rejectBtn} onClick={() => processStipend(s.id, 'REJECTED')}>Reject</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: '1100px', margin: '0 auto', padding: '2rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  title: { fontSize: '1.75rem', fontWeight: 700 },
  backBtn: { padding: '0.5rem 1rem', background: '#e2e8f0', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' },
  panel: { background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' },
  panelTitle: { fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' },
  item: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', borderBottom: '1px solid #f1f5f9', marginBottom: '0.5rem' },
  itemInfo: {},
  itemTitle: { fontWeight: 600 },
  itemSub: { color: '#64748b', fontSize: '0.875rem' },
  actions: { display: 'flex', gap: '0.5rem' },
  approveBtn: { padding: '4px 10px', background: '#059669', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' },
  processBtn: { padding: '4px 10px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' },
  rejectBtn: { padding: '4px 10px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' },
  empty: { color: '#94a3b8', fontStyle: 'italic' },
}

export default AdminDashboard
