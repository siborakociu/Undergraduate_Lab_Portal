import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { labApi } from '../api/labApi'
import { positionApi } from '../api/positionApi'
import type { LabOut } from '../types'

const CreatePositionPage: React.FC = () => {
  const navigate = useNavigate()
  const [labs, setLabs] = useState<LabOut[]>([])
  const [loadingLabs, setLoadingLabs] = useState(true)
  const [form, setForm] = useState({
    title: '',
    description: '',
    required_gpa: '',
    department: '',
    lab_id: '',
    stipend_per_student: '',
    max_students: '1',
  })
  const [isLoading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    labApi.getMine()
      .then((res) => {
        setLabs(res.data)
        if (res.data.length > 0) {
          setForm((f) => ({
            ...f,
            lab_id: res.data[0].id,
            department: f.department || (res.data[0].department ?? ''),
          }))
        }
      })
      .catch(() => setError('Failed to load your labs'))
      .finally(() => setLoadingLabs(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.lab_id) {
      setError('You need to create a lab first.')
      return
    }
    if (!form.title.trim() || !form.description.trim() || !form.department.trim()) {
      setError('Title, description, and department are required')
      return
    }
    const gpa = parseFloat(form.required_gpa)
    if (isNaN(gpa) || gpa < 0 || gpa > 4) {
      setError('Required GPA must be between 0 and 4')
      return
    }
    const stipend = parseFloat(form.stipend_per_student)
    if (isNaN(stipend) || stipend < 0) {
      setError('Stipend must be 0 or greater')
      return
    }
    const maxStudents = parseInt(form.max_students, 10)
    if (isNaN(maxStudents) || maxStudents < 1) {
      setError('Max students must be at least 1')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await positionApi.createPosition({
        title: form.title.trim(),
        description: form.description.trim(),
        required_gpa: gpa,
        department: form.department.trim(),
        lab_id: form.lab_id,
        stipend_per_student: stipend,
        max_students: maxStudents,
      })
      navigate('/positions/mine')
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Failed to create position')
    } finally {
      setLoading(false)
    }
  }

  const stipendNum = parseFloat(form.stipend_per_student)
  const maxNum = parseInt(form.max_students, 10)
  const totalFunding = !isNaN(stipendNum) && !isNaN(maxNum) ? stipendNum * maxNum : 0

  if (loadingLabs) return <div style={styles.page}><p>Loading…</p></div>

  if (labs.length === 0) {
    return (
      <div style={styles.page}>
        <div style={styles.header}>
          <h1 style={styles.title}>New Position</h1>
          <button style={styles.backBtn} onClick={() => navigate('/positions/mine')}>Back</button>
        </div>
        <div style={styles.emptyCard}>
          <p>You need to create a lab before you can create a position.</p>
          <button style={styles.submitBtn} onClick={() => navigate('/lab')}>Go to Lab Management</button>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>New Position</h1>
        <button style={styles.backBtn} onClick={() => navigate('/positions/mine')}>Back</button>
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        <label style={styles.label}>Lab</label>
        <select
          style={styles.input}
          value={form.lab_id}
          onChange={(e) => {
            const lab = labs.find((l) => l.id === e.target.value)
            setForm({
              ...form,
              lab_id: e.target.value,
              department: lab?.department ?? form.department,
            })
          }}
          required
        >
          {labs.map((lab) => (
            <option key={lab.id} value={lab.id}>
              {lab.name} {lab.department ? `(${lab.department})` : ''}
            </option>
          ))}
        </select>

        <label style={styles.label}>Title</label>
        <input
          style={styles.input}
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="e.g. Undergraduate Research Assistant — Neural Networks"
          required
        />

        <label style={styles.label}>Description</label>
        <textarea
          style={{ ...styles.input, minHeight: '140px', resize: 'vertical' }}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Describe the role, required skills, time commitment, and any other relevant details."
          required
        />

        <label style={styles.label}>Department</label>
        <input
          style={styles.input}
          value={form.department}
          onChange={(e) => setForm({ ...form, department: e.target.value })}
          placeholder="e.g. Computer Science"
          required
        />

        <label style={styles.label}>Required GPA</label>
        <input
          style={styles.input}
          type="number"
          step="0.1"
          min="0"
          max="4"
          value={form.required_gpa}
          onChange={(e) => setForm({ ...form, required_gpa: e.target.value })}
          placeholder="e.g. 3.0"
          required
        />

        <label style={styles.label}>Stipend per student (USD)</label>
        <input
          style={styles.input}
          type="number"
          step="0.01"
          min="0"
          value={form.stipend_per_student}
          onChange={(e) => setForm({ ...form, stipend_per_student: e.target.value })}
          placeholder="e.g. 500"
          required
        />

        <label style={styles.label}>Maximum number of students</label>
        <input
          style={styles.input}
          type="number"
          step="1"
          min="1"
          value={form.max_students}
          onChange={(e) => setForm({ ...form, max_students: e.target.value })}
          required
        />

        {totalFunding > 0 && (
          <div style={styles.fundingNote}>
            A funding request for <strong>${totalFunding.toFixed(2)}</strong>
            {' '}(stipend × max students) will be sent to admin for approval.
          </div>
        )}

        {error && <p style={styles.error}>{error}</p>}

        <button style={styles.submitBtn} type="submit" disabled={isLoading}>
          {isLoading ? 'Creating…' : 'Create Position'}
        </button>
      </form>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: '700px', margin: '0 auto', padding: '2rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  title: { fontSize: '1.75rem', fontWeight: 700 },
  backBtn: { padding: '0.5rem 1rem', background: '#e2e8f0', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  form: { background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  label: { fontWeight: 500, fontSize: '0.875rem', color: '#374151', marginTop: '0.5rem' },
  input: { padding: '0.625rem 0.875rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.95rem', fontFamily: 'inherit' },
  submitBtn: { marginTop: '1rem', padding: '0.75rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' },
  emptyCard: { background: '#fff', padding: '2rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', textAlign: 'center' },
  error: { color: '#dc2626', fontSize: '0.875rem', marginTop: '0.5rem' },
  fundingNote: { marginTop: '0.75rem', padding: '0.75rem 1rem', background: '#fef9c3', color: '#854d0e', borderRadius: '8px', fontSize: '0.875rem' },
}

export default CreatePositionPage
