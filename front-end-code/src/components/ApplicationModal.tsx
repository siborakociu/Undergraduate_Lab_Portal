import React, { useState } from 'react'
import { useApplications } from '../hooks/useApplications'

interface Props {
  positionId: string
  positionTitle: string
  onClose: () => void
}

const ApplicationModal: React.FC<Props> = ({ positionId, positionTitle, onClose }) => {
  const { submit, isLoading, error } = useApplications(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async () => {
    try {
      await submit({ position_id: positionId })
      setSubmitted(true)
    } catch {
      // error is already in `error` state
    }
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {submitted ? (
          <>
            <h2 style={styles.title}>Application Submitted!</h2>
            <p style={styles.text}>Your application has been successfully submitted.</p>
            <button style={styles.closeBtn} onClick={onClose}>Close</button>
          </>
        ) : (
          <>
            <h2 style={styles.title}>Confirm Application</h2>
            <p style={styles.text}>
              You are applying for <strong>{positionTitle}</strong>
            </p>
            {error && <p style={styles.error}>{error}</p>}
            <div style={styles.buttons}>
              <button style={styles.cancelBtn} onClick={onClose}>Cancel</button>
              <button style={styles.submitBtn} onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? 'Submitting…' : 'Submit Application'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: '#fff', padding: '2rem', borderRadius: '16px', width: '100%', maxWidth: '420px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' },
  title: { fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' },
  text: { color: '#374151', marginBottom: '1rem' },
  error: { color: '#dc2626', marginBottom: '0.75rem', fontSize: '0.875rem' },
  buttons: { display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' },
  cancelBtn: { padding: '0.625rem 1.25rem', background: '#e2e8f0', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 },
  submitBtn: { padding: '0.625rem 1.25rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 },
  closeBtn: { padding: '0.625rem 1.25rem', background: '#059669', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 },
}

export default ApplicationModal
