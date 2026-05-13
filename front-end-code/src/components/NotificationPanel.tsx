import React from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNotifications } from '../hooks/useNotifications'

const NotificationPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { user } = useAuth()
  const { notifications, markRead } = useNotifications(user?.id)

  return (
    <div style={styles.panel}>
      <div style={styles.header}>
        <h3 style={styles.title}>Notifications</h3>
        <button style={styles.closeBtn} onClick={onClose}>×</button>
      </div>
      {notifications.length === 0 && <p style={styles.empty}>No notifications</p>}
      {notifications.map((n) => (
        <div
          key={n.id}
          style={{ ...styles.item, background: n.is_read ? '#fff' : '#eff6ff' }}
          onClick={() => !n.is_read && markRead(n.id)}
        >
          <p style={styles.message}>{n.message}</p>
          {n.created_at && (
            <p style={styles.time}>{new Date(n.created_at).toLocaleString()}</p>
          )}
          {!n.is_read && <span style={styles.dot} />}
        </div>
      ))}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  panel: {
    position: 'absolute', right: 0, top: '100%', width: '320px',
    background: '#fff', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
    zIndex: 200, overflow: 'hidden',
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem 1rem', borderBottom: '1px solid #f1f5f9' },
  title: { fontWeight: 600, fontSize: '0.95rem' },
  closeBtn: { background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#64748b' },
  item: { padding: '0.875rem 1rem', borderBottom: '1px solid #f8fafc', cursor: 'pointer', position: 'relative' },
  message: { fontSize: '0.875rem', color: '#374151' },
  time: { fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' },
  dot: { position: 'absolute', top: '0.875rem', right: '1rem', width: '8px', height: '8px', borderRadius: '50%', background: '#2563eb' },
  empty: { padding: '1.5rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem' },
}

export default NotificationPanel
