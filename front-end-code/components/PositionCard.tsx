import React, { useState } from 'react'
import type { PositionOut } from '../types'
import ApplicationModal from './ApplicationModal'

interface Props {
  position: PositionOut
}

const statusColors: Record<string, string> = {
  OPEN: '#059669',
  CLOSED: '#dc2626',
  FILLED: '#d97706',
}

const PositionCard: React.FC<Props> = ({ position }) => {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <div style={styles.card}>
        <div style={styles.top}>
          <h3 style={styles.title}>{position.title}</h3>
          <span style={{ ...styles.badge, background: statusColors[position.status] ?? '#64748b' }}>
            {position.status}
          </span>
        </div>
        {position.department && <p style={styles.dept}>{position.department}</p>}
        {position.description && <p style={styles.desc}>{position.description}</p>}
        {position.required_gpa != null && (
          <p style={styles.gpa}>Min GPA: {Number(position.required_gpa).toFixed(2)}</p>
        )}
        {position.status === 'OPEN' && (
          <button style={styles.applyBtn} onClick={() => setShowModal(true)}>
            Apply
          </button>
        )}
      </div>
      {showModal && (
        <ApplicationModal positionId={position.id} onClose={() => setShowModal(false)} />
      )}
    </>
  )
}

const styles: Record<string, React.CSSProperties> = {
  card: { background: '#fff', padding: '1.25rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  top: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontWeight: 700, fontSize: '1rem', flex: 1 },
  badge: { padding: '2px 8px', borderRadius: '12px', color: '#fff', fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap' },
  dept: { color: '#2563eb', fontSize: '0.875rem', fontWeight: 500 },
  desc: { color: '#64748b', fontSize: '0.875rem', lineHeight: 1.5 },
  gpa: { fontSize: '0.8rem', color: '#374151', fontWeight: 500 },
  applyBtn: { marginTop: '0.5rem', padding: '0.5rem 1rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, alignSelf: 'flex-start' },
}

export default PositionCard
