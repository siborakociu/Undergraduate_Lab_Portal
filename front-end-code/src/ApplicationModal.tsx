import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useNotifications } from '../hooks/useNotifications'
import NotificationPanel from './NotificationPanel'

const ICONS: Record<string, string> = {
  search:    'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  globe:     'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  document:  'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  user:      'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  clipboard: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
  users:     'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
  beaker:    'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
  dollar:    'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  chartBar:  'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  shield:    'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  trending:  'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
  bell:      'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
  logout:    'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
}

function Icon({ name, size = 17 }: { name: string; size?: number }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0 }}
    >
      <path d={ICONS[name] ?? ''} />
    </svg>
  )
}

const navItems: Record<string, { label: string; path: string; icon: string }[]> = {
  STUDENT: [
    { label: 'Browse Opportunities', path: '/opportunities', icon: 'search' },
    { label: 'External Programs',    path: '/programs',      icon: 'globe' },
    { label: 'My Applications',      path: '/applications',  icon: 'document' },
    { label: 'My Profile',           path: '/profile',       icon: 'user' },
  ],
  PROFESSOR: [
    { label: 'Manage Positions', path: '/positions/mine', icon: 'clipboard' },
    { label: 'View Applicants',  path: '/applicants',     icon: 'users' },
    { label: 'Lab Management',   path: '/lab',            icon: 'beaker' },
    { label: 'Request Funding',  path: '/funding',        icon: 'dollar' },
  ],
  HR_STAFF: [
    { label: 'Manage Programs',   path: '/hr/programs',                icon: 'clipboard' },
    { label: 'Review Applicants', path: '/hr/programs?tab=applicants', icon: 'users' },
  ],
  ADMIN: [
    { label: 'Research Overview',  path: '/admin?tab=overview',   icon: 'chartBar' },
    { label: 'Lab Compliance',     path: '/admin?tab=compliance', icon: 'shield' },
    { label: 'Funding & Stipends', path: '/admin?tab=funding',    icon: 'dollar' },
    { label: 'Reports',            path: '/admin?tab=reports',    icon: 'trending' },
  ],
}

const LogoMark: React.FC = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 01-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
  </svg>
)

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { unreadCount } = useNotifications(user?.id)
  const [showNotifs, setShowNotifs] = useState(false)
  const notifBtnRef = useRef<HTMLButtonElement>(null)
  const notifPanelRef = useRef<HTMLDivElement>(null)

  const items = user ? (navItems[user.role] ?? []) : []

  const isActive = (path: string) =>
    location.pathname === path.split('?')[0] &&
    (!path.includes('?') || location.search === `?${path.split('?')[1]}`)

  // Close panel when clicking outside
  useEffect(() => {
    if (!showNotifs) return
    const handler = (e: MouseEvent) => {
      if (
        notifBtnRef.current && !notifBtnRef.current.contains(e.target as Node) &&
        notifPanelRef.current && !notifPanelRef.current.contains(e.target as Node)
      ) {
        setShowNotifs(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showNotifs])

  // Close panel on route change
  useEffect(() => { setShowNotifs(false) }, [location.pathname])

  // Compute fixed position — always to the right of the 240px sidebar
  const getNotifPanelStyle = (): React.CSSProperties => {
    const SIDEBAR_WIDTH = 248
    const PANEL_HEIGHT = 450
    const top = notifBtnRef.current
      ? Math.max(8, Math.min(notifBtnRef.current.getBoundingClientRect().top, window.innerHeight - PANEL_HEIGHT - 8))
      : window.innerHeight - PANEL_HEIGHT - 16
    return { position: 'fixed', left: SIDEBAR_WIDTH, top, zIndex: 1000 }
  }

  return (
    <aside style={styles.sidebar}>
      <div style={styles.logo} onClick={() => navigate('/dashboard')}>
        <LogoMark />
        <span style={styles.logoText}>Lab Portal</span>
      </div>

      <nav style={styles.nav}>
        <p style={styles.sectionLabel}>Navigation</p>
        {items.map((item) => {
          const active = isActive(item.path)
          return (
            <button
              key={item.path}
              className={`sidebar-nav-item${active ? ' sidebar-nav-active' : ''}`}
              style={{ ...styles.navItem, ...(active ? styles.navItemActive : {}) }}
              onClick={() => navigate(item.path)}
            >
              <Icon name={item.icon} />
              <span style={styles.navLabel}>{item.label}</span>
              {active && <span style={styles.activeDot} />}
            </button>
          )
        })}
      </nav>

      <div style={styles.bottom}>
        {/* Notification button — panel renders via fixed positioning outside the sidebar */}
        <button
          ref={notifBtnRef}
          className="sidebar-notif-btn"
          style={styles.notifBtn}
          onClick={() => setShowNotifs((v) => !v)}
        >
          <Icon name="bell" />
          <span style={styles.notifLabel}>Notifications</span>
          {unreadCount > 0 && <span style={styles.badge}>{unreadCount}</span>}
        </button>

        <div style={styles.userRow}>
          <div style={styles.avatar}>
            {user?.username?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div style={styles.userInfo}>
            <span style={styles.username}>{user?.username}</span>
            <span style={styles.role}>{user?.role.replace('_', ' ')}</span>
          </div>
        </div>

        <button
          className="sidebar-logout"
          style={styles.logoutBtn}
          onClick={async () => { await logout(); navigate('/login') }}
        >
          <Icon name="logout" size={15} />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Rendered into document.body via portal — escapes sidebar overflow/stacking */}
      {showNotifs && createPortal(
        <div ref={notifPanelRef} style={getNotifPanelStyle()}>
          <NotificationPanel onClose={() => setShowNotifs(false)} />
        </div>,
        document.body
      )}
    </aside>
  )
}

const styles: Record<string, React.CSSProperties> = {
  sidebar: {
    width: '240px',
    minWidth: '240px',
    height: '100vh',
    background: '#1e293b',
    display: 'flex',
    flexDirection: 'column',
    position: 'sticky',
    top: 0,
    overflowY: 'auto',
    boxShadow: '2px 0 12px rgba(0,0,0,0.18)',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    padding: '1.4rem 1.25rem 1rem',
    cursor: 'pointer',
    borderBottom: '1px solid #334155',
    marginBottom: '0.5rem',
  },
  logoText: {
    color: '#60a5fa',
    fontWeight: 700,
    fontSize: '1rem',
    letterSpacing: '0.02em',
  },
  nav: {
    flex: 1,
    padding: '0 0.75rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.15rem',
  },
  sectionLabel: {
    color: '#475569',
    fontSize: '0.68rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.09em',
    margin: '0.5rem 0.5rem 0.6rem',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.7rem',
    width: '100%',
    padding: '0.6rem 0.75rem',
    background: 'none',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    textAlign: 'left',
    color: '#94a3b8',
    fontSize: '0.86rem',
    fontWeight: 500,
    position: 'relative',
  },
  navItemActive: {
    background: 'rgba(37, 99, 235, 0.18)',
    color: '#60a5fa',
    fontWeight: 600,
  },
  activeDot: {
    position: 'absolute',
    right: '0.75rem',
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#2563eb',
  },
  navLabel: { lineHeight: 1.3, flex: 1 },
  bottom: {
    padding: '0.75rem',
    borderTop: '1px solid #334155',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  notifBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    width: '100%',
    padding: '0.55rem 0.75rem',
    background: 'none',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    color: '#94a3b8',
    fontSize: '0.86rem',
  },
  notifLabel: { flex: 1, textAlign: 'left' },
  badge: {
    background: '#ef4444',
    color: '#fff',
    borderRadius: '999px',
    fontSize: '0.65rem',
    padding: '1px 6px',
    fontWeight: 700,
  },
  userRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    padding: '0.4rem 0.5rem',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #2563eb, #0891b2)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '0.85rem',
    flexShrink: 0,
  },
  userInfo: { display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 },
  username: {
    color: '#e2e8f0',
    fontSize: '0.85rem',
    fontWeight: 600,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  role: {
    color: '#475569',
    fontSize: '0.68rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    width: '100%',
    padding: '0.5rem',
    background: 'rgba(127, 29, 29, 0.15)',
    border: '1px solid rgba(127, 29, 29, 0.35)',
    borderRadius: '8px',
    color: '#f87171',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: 600,
  },
}

export default Sidebar
