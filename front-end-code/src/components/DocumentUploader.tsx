import React, { useEffect, useRef, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import apiClient from '../api/apiClient'
import { studentApi } from '../api/studentApi'
import type { DocumentOut } from '../types'

const DocumentUploader: React.FC = () => {
  const { user } = useAuth()
  const fileRef = useRef<HTMLInputElement>(null)
  const [isLoading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [docs, setDocs] = useState<DocumentOut[]>([])

  const loadDocs = async () => {
    if (!user) return
    try {
      const profileRes = await studentApi.getProfile(user.id)
      const profile = profileRes.data
      const res = await apiClient.get<DocumentOut[]>(`/documents/student/${profile.id}`)
      setDocs(res.data)
    } catch {
      // ignore
    }
  }

  useEffect(() => { loadDocs() }, [user?.id])

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setLoading(true)
    setError(null)
    const formData = new FormData()
    formData.append('file', file)
    try {
      await apiClient.post<DocumentOut>('/documents', formData, {
        headers: { 'Content-Type': undefined },
      })
      await loadDocs()
      if (fileRef.current) fileRef.current.value = ''
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setError(msg ?? 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.dropZone} onClick={() => fileRef.current?.click()}>
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
      {docs.length > 0 && (
        <div style={styles.list}>
          <p style={styles.listTitle}>Uploaded documents ({docs.length})</p>
          {docs.map((d) => (
            <div key={d.id} style={styles.docRow}>
              <div>
                <p style={styles.docName}>{d.file_name}</p>
                {d.uploaded_at && (
                  <p style={styles.docDate}>{new Date(d.uploaded_at).toLocaleDateString()}</p>
                )}
              </div>
              <button
                style={styles.removeBtn}
                onClick={async () => {
                  if (!confirm(`Delete "${d.file_name}"?`)) return
                  try {
                    await apiClient.delete(`/documents/${d.id}`)
                    await loadDocs()
                  } catch {
                    setError('Failed to delete document')
                  }
                }}
              >
                Remove
              </button>
            </div>
          ))}
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
  list: { background: '#f8fafc', borderRadius: '8px', padding: '0.75rem' },
  listTitle: { fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '0.5rem' },
  docRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid #e2e8f0' },
  docName: { fontSize: '0.875rem', color: '#0f172a' },
  docDate: { fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.125rem' },
  removeBtn: { padding: '4px 12px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 },
}

export default DocumentUploader
