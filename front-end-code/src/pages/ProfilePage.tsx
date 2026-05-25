import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useStudentProfile } from '../hooks/useStudentProfile'
import DocumentUploader from '../components/DocumentUploader'

const ProfilePage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { profile, updateProfile, isLoading, error } = useStudentProfile(user?.id)

  const [form, setForm] = useState({ full_name: '', gpa: '', major: '', skills: '' })

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name,
        gpa: profile.gpa?.toString() ?? '',
        major: profile.major ?? '',
        skills: profile.skills.join(', '),
      })
    }
  }, [profile])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    await updateProfile({
      full_name: form.full_name || undefined,
      gpa: form.gpa ? parseFloat(form.gpa) : undefined,
      major: form.major || undefined,
      skills: form.skills ? form.skills.split(',').map((s) => s.trim()) : undefined,
    })
  }

  if (!user) {
    navigate('/login')
    return null
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>My Profile</h1>
        <button style={styles.backBtn} onClick={() => navigate('/dashboard')}>Back</button>
      </div>

      {isLoading && <p style={styles.info}>Loading…</p>}
      {error && <p style={styles.error}>{error}</p>}

      <div style={styles.grid}>
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Profile Information</h2>
          <form onSubmit={handleSave} style={styles.form}>
            {([
              { key: 'full_name', label: 'Full Name', type: 'text' },
              { key: 'gpa', label: 'GPA', type: 'number' },
              { key: 'major', label: 'Major', type: 'text' },
              { key: 'skills', label: 'Skills (comma-separated)', type: 'text' },
            ] as const).map(({ key, label, type }) => (
              <React.Fragment key={key}>
                <label style={styles.label}>{label}</label>
                <input
                  style={styles.input}
                  type={type}
                  step={type === 'number' ? '0.01' : undefined}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
              </React.Fragment>
            ))}
            <button style={styles.saveBtn} type="submit" disabled={isLoading}>
              Save Changes
            </button>
          </form>
          {profile && (
            <div style={styles.statusBadge}>
              Profile — {profile.is_complete ? 'Complete' : 'Incomplete'}
            </div>
          )}
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Documents</h2>
          <DocumentUploader />
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: '900px', margin: '0 auto', padding: '2rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  title: { fontSize: '1.75rem', fontWeight: 700 },
  backBtn: { padding: '0.5rem 1rem', background: '#e2e8f0', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' },
  section: { background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' },
  sectionTitle: { fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '0.625rem' },
  label: { fontWeight: 500, fontSize: '0.875rem', color: '#374151' },
  input: { padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.9rem' },
  saveBtn: { marginTop: '0.5rem', padding: '0.625rem', background: '#059669', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' },
  statusBadge: { marginTop: '1rem', padding: '0.5rem 0.75rem', background: '#f0fdf4', color: '#166534', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 500 },
  info: { color: '#64748b' },
  error: { color: '#dc2626' },
}

export default ProfilePage
