import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useNotifications } from '../hooks/useNotifications'
import NotificationPanel from './NotificationPanel'

const Navbar: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { unreadCount } = useNotifications(user?.id)
  const [showNotifs, setShowNotifs] = useState(false)

  const navLinks: Record<string, { label: string; path: string }[]> = {
    STUDENT: [
      { label: 'Dashboard', path: '/dashboard' },
      { label: 'Opportunities', path: '/opportunities' },
      { label: 'Programs', path: '/programs' },
      { label: 'Applications', path: '/applications' },
      { label: 'Profile', path: '/profile' },
    ],
    PROFESSOR: [
      { label: 'Dashboard', path: '/dashboard' },
      { label: 'Positions', path: '/positions/mine' },
      { label: 'Applicants', path: '/applicants' },
      { label: 'Lab', path: '/lab' },
      { label: 'Funding', path: '/funding' },
    ],
    HR_STAFF: [
      { label: 'Dashboard', path: '/dashboard' },
      { label: 'Programs', path: '/hr/programs' },
      { label: 'Applicants', path: '/hr/programs?tab=applicants' },
    ],
    ADMIN: [
      { label: 'Dashboard', path: '/dashboard' },
      { label: 'Admin Panel', path: '/admin' },
    ],
  }

  const links = user ? (navLinks[user.role] ?? []) : []

  return (
    <nav style={styles.nav}>
      <div style={styles.left}>
        <span style={styles.logo} onClick={() => navigate('/dashboard')}>
          Lab Portal
        </span>
        {links.map((l) => (
          <button key={l.path} style={styles.link} onClick={() => navigate(l.path)}>
            {l.label}
          </button>
        ))}
      </div>

      {user && (
        <div style={styles.right}>
          <div style={styles.notifWrapper}>
            <button style={styles.notifBtn} onClick={() => setShowNotifs((v) => !v)}>
              Notifications {unreadCount > 0 && <span style={styles.badge}>{unreadCount}</span>}
            </button>
            {showNotifs && <NotificationPanel onClose={() => setShowNotifs(false)} />}
          </div>
          <span style={styles.username}>{user.username}</span>
          <button
            style={styles.logoutBtn}
            onClick={async () => { await logout(); navigate('/login') }}
          >
            Sign Out
          </button>
        </div>
      )}
    </nav>
  )
}

const styles: Record<string, React.CSSProperties> = {
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem 1.5rem', background: '#1e293b', color: '#fff', position: 'sticky', top: 0, zIndex: 100 },
  left: { display: 'flex', alignItems: 'center', gap: '1rem' },
  logo: { fontWeight: 700, fontSize: '1.1rem', cursor: 'pointer', color: '#60a5fa' },
  link: { background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', fontSize: '0.9rem', padding: '0.25rem 0.5rem', borderRadius: '6px' },
  right: { display: 'flex', alignItems: 'center', gap: '1rem' },
  notifWrapper: { position: 'relative' },
  notifBtn: { background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.1rem', position: 'relative' },
  badge: { position: 'absolute', top: '-4px', right: '-8px', background: '#ef4444', color: '#fff', borderRadius: '50%', fontSize: '0.65rem', padding: '1px 5px', fontWeight: 700 },
  username: { color: '#94a3b8', fontSize: '0.875rem' },
  logoutBtn: { padding: '0.375rem 0.75rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 },
}

export default Navbar
