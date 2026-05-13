import React, { useRef, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import apiClient from '../api/apiClient'
import type { DocumentOut } from '../types'

const DocumentUploader: React.FC = () => {
  const { user } = useAuth()
  const fileRef = useRef<HTMLInputElement>(null)
  const [isLoading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploaded, setUploaded] = useState<DocumentOut | null>(null)

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setLoading(true)
    setError(null)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await apiClient.post<DocumentOut>('/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setUploaded(res.data)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setError(msg ?? 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div
        style={styles.dropZone}
        onClick={() => fileRef.current?.click()}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.doc,.docx"
          style={{ display: 'none' }}
          onChange={handleChange}
        />
        <p style={styles.dropText}>
          {isLoading ? 'Uploading…' : 'Click to upload a document'}
        </p>
        <p style={styles.hint}>PDF, DOC, DOCX · Max 5 MB</p>
      </div>
      {error && <p style={styles.error}>{error}</p>}
      {uploaded && (
        <div style={styles.success}>
          Uploaded: <strong>{uploaded.file_name}</strong>
        </div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  dropZone: {
    border: '2px dashed #d1d5db', borderRadius: '10px', padding: '2rem',
    textAlign: 'center', cursor: 'pointer', background: '#f8fafc',
    transition: 'border-color 0.15s',
  },
  dropText: { color: '#374151', fontWeight: 500 },
  hint: { color: '#94a3b8', fontSize: '0.8rem', marginTop: '0.25rem' },
  error: { color: '#dc2626', fontSize: '0.875rem' },
  success: { padding: '0.625rem', background: '#f0fdf4', color: '#166534', borderRadius: '8px', fontSize: '0.875rem' },
}

export default DocumentUploader
