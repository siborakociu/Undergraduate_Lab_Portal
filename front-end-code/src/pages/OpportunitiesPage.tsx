import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePositions } from '../hooks/usePositions'
import PositionCard from '../components/PositionCard'
import type { PositionFilters } from '../types'

const OpportunitiesPage: React.FC = () => {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<PositionFilters>({})
  const [dept, setDept] = useState('')
  const [gpa, setGpa] = useState('')
  const { positions, isLoading, error } = usePositions(filters)

  const applyFilters = () => {
    setFilters({ dept: dept || undefined, gpa: gpa ? parseFloat(gpa) : undefined })
  }

  const clearFilters = () => {
    setDept('')
    setGpa('')
    setFilters({})
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Open Positions</h1>
        <button style={styles.backBtn} onClick={() => navigate('/dashboard')}>Back</button>
      </div>

      <div style={styles.filterBar}>
        <input
          style={styles.filterInput}
          placeholder="Department"
          value={dept}
          onChange={(e) => setDept(e.target.value)}
        />
        <input
          style={styles.filterInput}
          placeholder="Min GPA"
          type="number"
          step="0.1"
          min="0"
          max="4"
          value={gpa}
          onChange={(e) => setGpa(e.target.value)}
        />
        <button style={styles.filterBtn} onClick={applyFilters}>Filter</button>
        <button style={styles.clearBtn} onClick={clearFilters}>Clear</button>
      </div>

      {error && <p style={styles.error}>{error}</p>}
      {isLoading && <p style={styles.loading}>Loading positions…</p>}

      <div style={styles.grid}>
        {positions.map((p) => (
          <PositionCard key={p.id} position={p} />
        ))}
        {!isLoading && positions.length === 0 && (
          <p style={styles.empty}>No open positions found.</p>
        )}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: '1000px', margin: '0 auto', padding: '2rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  title: { fontSize: '1.75rem', fontWeight: 700 },
  backBtn: { padding: '0.5rem 1rem', background: '#e2e8f0', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  filterBar: { display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' },
  filterInput: { padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.9rem' },
  filterBtn: { padding: '0.5rem 1rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  clearBtn: { padding: '0.5rem 1rem', background: '#e2e8f0', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' },
  error: { color: '#dc2626' },
  loading: { color: '#64748b' },
  empty: { color: '#94a3b8', gridColumn: '1/-1' },
}

export default OpportunitiesPage
