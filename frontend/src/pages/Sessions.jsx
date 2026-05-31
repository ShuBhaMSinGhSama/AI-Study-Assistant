import { useState, useEffect } from 'react'
import { fetchSessions, createSession, deleteSession } from '../services/api'
import './Sessions.css'

export default function Sessions() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState({ title: '', duration_minutes: 30, notes: '', date: new Date().toISOString().split('T')[0] })
  const [creating, setCreating] = useState(false)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchSessions()
      setSessions(data.results || data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setCreating(true)
    try {
      await createSession(createForm)
      setShowCreateModal(false)
      setCreateForm({ title: '', duration_minutes: 30, notes: '', date: new Date().toISOString().split('T')[0] })
      loadSessions()
    } catch (err) {
      alert('Failed to log session: ' + err.message)
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this session?')) return
    try {
      await deleteSession(id)
      loadSessions()
    } catch (err) {
      alert('Failed to delete session: ' + err.message)
    }
  }

  const formatDuration = (mins) => {
    if (!mins) return '0m'
    if (mins >= 60) {
      const h = Math.floor(mins / 60)
      const m = mins % 60
      return m > 0 ? `${h}h ${m}m` : `${h}h`
    }
    return `${mins}m`
  }

  // Compute weekly data from sessions
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay())
  weekStart.setHours(0, 0, 0, 0)

  const weeklyMap = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 }
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  sessions.forEach(s => {
    const sessionDate = new Date(s.date)
    if (sessionDate >= weekStart) {
      const dayName = dayNames[sessionDate.getDay()]
      weeklyMap[dayName] += (s.duration_minutes || 0) / 60
    }
  })

  const orderedDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const weeklyDataOrdered = orderedDays.map(d => ({ day: d, hours: Math.round((weeklyMap[d] || 0) * 10) / 10 }))
  const maxHours = Math.max(...weeklyDataOrdered.map(d => d.hours), 0.1)
  const totalWeekHours = weeklyDataOrdered.reduce((sum, d) => sum + d.hours, 0)

  // Summary stats
  const totalSessions = sessions.length
  const avgDuration = totalSessions > 0 ? Math.round(sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) / totalSessions) : 0
  const thisMonthSessions = sessions.filter(s => {
    const d = new Date(s.date)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  // Filter sessions by tab
  const filteredSessions = sessions.filter(session => {
    if (activeTab === 'all') return true
    const sessionDate = new Date(session.date)
    if (activeTab === 'this week') {
      return sessionDate >= weekStart
    }
    if (activeTab === 'this month') {
      return sessionDate.getMonth() === now.getMonth() && sessionDate.getFullYear() === now.getFullYear()
    }
    return true
  })

  // Sort by date descending
  const sortedSessions = [...filteredSessions].sort((a, b) => new Date(b.date) - new Date(a.date))

  if (loading) {
    return (
      <div className="sessions">
        <div className="sessions__header animate-fade-in">
          <div>
            <h1 className="sessions__title">Study Sessions</h1>
            <p className="sessions__subtitle">Track your learning progress and study habits</p>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4rem 0' }}>
          <div className="loading-spinner" />
          <span style={{ marginLeft: '1rem', color: 'var(--text-secondary)' }}>Loading sessions...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="sessions">
        <div className="sessions__header animate-fade-in">
          <div>
            <h1 className="sessions__title">Study Sessions</h1>
            <p className="sessions__subtitle">Track your learning progress and study habits</p>
          </div>
        </div>
        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--color-error)', marginBottom: '1rem' }}>⚠️ {error}</p>
          <button className="btn btn-primary" onClick={loadSessions}>Retry</button>
        </div>
      </div>
    )
  }

  return (
    <div className="sessions">
      {/* Header */}
      <div className="sessions__header animate-fade-in">
        <div>
          <h1 className="sessions__title">Study Sessions</h1>
          <p className="sessions__subtitle">Track your learning progress and study habits</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>+ New Session</button>
      </div>

      {/* Summary Cards */}
      <div className="sessions__summary animate-fade-in stagger-1">
        <div className="sessions__summary-card glass-card">
          <div className="sessions__summary-icon">⏱️</div>
          <div className="sessions__summary-data">
            <span className="sessions__summary-value">{totalWeekHours.toFixed(1)}h</span>
            <span className="sessions__summary-label">This Week</span>
          </div>
        </div>
        <div className="sessions__summary-card glass-card">
          <div className="sessions__summary-icon">📚</div>
          <div className="sessions__summary-data">
            <span className="sessions__summary-value">{totalSessions}</span>
            <span className="sessions__summary-label">Total Sessions</span>
          </div>
        </div>
        <div className="sessions__summary-card glass-card">
          <div className="sessions__summary-icon">🎯</div>
          <div className="sessions__summary-data">
            <span className="sessions__summary-value">{formatDuration(avgDuration)}</span>
            <span className="sessions__summary-label">Avg Duration</span>
          </div>
        </div>
        <div className="sessions__summary-card glass-card">
          <div className="sessions__summary-icon">📅</div>
          <div className="sessions__summary-data">
            <span className="sessions__summary-value">{thisMonthSessions}</span>
            <span className="sessions__summary-label">This Month</span>
          </div>
        </div>
      </div>

      {/* Weekly Chart */}
      <div className="sessions__chart glass-card animate-fade-in stagger-2">
        <h3 className="sessions__chart-title">Weekly Study Time</h3>
        <div className="sessions__chart-bars">
          {weeklyDataOrdered.map((d, i) => (
            <div key={d.day} className="sessions__bar-group">
              <div className="sessions__bar-value">{d.hours}h</div>
              <div className="sessions__bar-track">
                <div
                  className="sessions__bar-fill"
                  style={{
                    height: `${(d.hours / maxHours) * 100}%`,
                    animationDelay: `${i * 0.08}s`,
                  }}
                />
              </div>
              <span className="sessions__bar-label">{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sessions List */}
      <div className="sessions__list-section animate-fade-in stagger-3">
        <div className="sessions__list-header">
          <h3 className="sessions__list-title">Session History</h3>
          <div className="sessions__tabs">
            {['all', 'this week', 'this month'].map(tab => (
              <button
                key={tab}
                className={`sessions__tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="sessions__list">
          {sortedSessions.length === 0 ? (
            <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-lg)', marginBottom: '0.5rem' }}>📭 No sessions found</p>
              <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>
                {activeTab !== 'all' ? 'Try selecting a different time range or ' : ''}
                Log your first study session to get started!
              </p>
            </div>
          ) : (
            sortedSessions.map((session, index) => (
              <div
                key={session.id}
                className={`sessions__card glass-card-interactive animate-fade-in-up stagger-${Math.min(index + 4, 8)}`}
              >
                <div className="sessions__card-left">
                  <div className="sessions__card-date-badge">
                    <span className="sessions__card-day">{new Date(session.date).getDate()}</span>
                    <span className="sessions__card-month">{new Date(session.date).toLocaleString('default', { month: 'short' })}</span>
                  </div>
                </div>
                <div className="sessions__card-content">
                  <h4 className="sessions__card-title">{session.title}</h4>
                  {session.notes && <p className="sessions__card-notes">{session.notes}</p>}
                  <div className="sessions__card-meta">
                    <span className="sessions__card-meta-item">
                      ⏱️ {formatDuration(session.duration_minutes)}
                    </span>
                    <span className="sessions__card-meta-item">
                      📅 {new Date(session.date).toLocaleDateString('default', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
                <div style={{ flexShrink: 0 }}>
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '0.4rem 0.75rem', fontSize: 'var(--text-xs)' }}
                    onClick={() => handleDelete(session.id)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Session Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => setShowCreateModal(false)}>
          <div className="glass-card-strong" onClick={e => e.stopPropagation()} style={{
            width: '100%', maxWidth: '500px', padding: '2rem',
            borderRadius: 'var(--radius-xl)', margin: '1rem'
          }}>
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Log Study Session</h2>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input
                className="input-glass"
                placeholder="Session Title"
                value={createForm.title}
                onChange={e => setCreateForm(p => ({...p, title: e.target.value}))}
                required
                style={{ width: '100%' }}
              />
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>Duration (minutes)</label>
                  <input
                    type="number"
                    className="input-glass"
                    min={1}
                    value={createForm.duration_minutes}
                    onChange={e => setCreateForm(p => ({...p, duration_minutes: parseInt(e.target.value) || 0}))}
                    style={{ width: '100%' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>Date</label>
                  <input
                    type="date"
                    className="input-glass"
                    value={createForm.date}
                    onChange={e => setCreateForm(p => ({...p, date: e.target.value}))}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
              <textarea
                className="input-glass"
                placeholder="Session notes..."
                value={createForm.notes}
                onChange={e => setCreateForm(p => ({...p, notes: e.target.value}))}
                rows={3}
                style={{ width: '100%', resize: 'vertical' }}
              />
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={creating}>{creating ? 'Saving...' : 'Log Session'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
