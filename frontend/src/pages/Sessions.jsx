import { useState } from 'react'
import './Sessions.css'

const mockSessions = [
  { id: 1, title: 'Neural Networks Deep Dive', date: '2024-01-15', duration: '1h 25m', durationMins: 85, notes: 'Covered backpropagation, activation functions, and loss optimization. Reviewed 3 chapters.', flashcardsReviewed: 24, accuracy: 88 },
  { id: 2, title: 'Data Structures Review', date: '2024-01-14', duration: '45m', durationMins: 45, notes: 'Practiced binary tree traversals and hash table implementations. Good progress.', flashcardsReviewed: 15, accuracy: 92 },
  { id: 3, title: 'Linear Algebra Practice', date: '2024-01-13', duration: '1h 10m', durationMins: 70, notes: 'Matrix operations, eigenvalue computation, and vector space problems.', flashcardsReviewed: 20, accuracy: 75 },
  { id: 4, title: 'Python Algorithms', date: '2024-01-12', duration: '55m', durationMins: 55, notes: 'Implemented sorting algorithms from scratch. Compared time complexities.', flashcardsReviewed: 12, accuracy: 95 },
  { id: 5, title: 'Statistics Fundamentals', date: '2024-01-11', duration: '1h 30m', durationMins: 90, notes: 'Probability distributions, hypothesis testing basics, and confidence intervals.', flashcardsReviewed: 30, accuracy: 82 },
]

const weeklyData = [
  { day: 'Mon', hours: 2.5 },
  { day: 'Tue', hours: 1.8 },
  { day: 'Wed', hours: 3.2 },
  { day: 'Thu', hours: 0.5 },
  { day: 'Fri', hours: 2.1 },
  { day: 'Sat', hours: 4.0 },
  { day: 'Sun', hours: 1.5 },
]

const maxHours = Math.max(...weeklyData.map(d => d.hours))
const totalWeekHours = weeklyData.reduce((sum, d) => sum + d.hours, 0)

export default function Sessions() {
  const [activeTab, setActiveTab] = useState('all')

  return (
    <div className="sessions">
      {/* Header */}
      <div className="sessions__header animate-fade-in">
        <div>
          <h1 className="sessions__title">Study Sessions</h1>
          <p className="sessions__subtitle">Track your learning progress and study habits</p>
        </div>
        <button className="btn btn-primary">+ New Session</button>
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
          <div className="sessions__summary-icon">🔥</div>
          <div className="sessions__summary-data">
            <span className="sessions__summary-value">5</span>
            <span className="sessions__summary-label">Day Streak</span>
          </div>
        </div>
        <div className="sessions__summary-card glass-card">
          <div className="sessions__summary-icon">🎯</div>
          <div className="sessions__summary-data">
            <span className="sessions__summary-value">86%</span>
            <span className="sessions__summary-label">Avg. Accuracy</span>
          </div>
        </div>
        <div className="sessions__summary-card glass-card">
          <div className="sessions__summary-icon">🎴</div>
          <div className="sessions__summary-data">
            <span className="sessions__summary-value">101</span>
            <span className="sessions__summary-label">Cards Reviewed</span>
          </div>
        </div>
      </div>

      {/* Weekly Chart */}
      <div className="sessions__chart glass-card animate-fade-in stagger-2">
        <h3 className="sessions__chart-title">Weekly Study Time</h3>
        <div className="sessions__chart-bars">
          {weeklyData.map((d, i) => (
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
          {mockSessions.map((session, index) => (
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
                <p className="sessions__card-notes">{session.notes}</p>
                <div className="sessions__card-meta">
                  <span className="sessions__card-meta-item">
                    ⏱️ {session.duration}
                  </span>
                  <span className="sessions__card-meta-item">
                    🎴 {session.flashcardsReviewed} cards
                  </span>
                  <span className="sessions__card-meta-item">
                    🎯 {session.accuracy}%
                  </span>
                </div>
              </div>
              <div className="sessions__card-accuracy">
                <div className="sessions__accuracy-ring">
                  <svg viewBox="0 0 36 36" className="sessions__accuracy-svg">
                    <path
                      className="sessions__accuracy-bg"
                      d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="sessions__accuracy-fill"
                      strokeDasharray={`${session.accuracy}, 100`}
                      d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831"
                      style={{
                        stroke: session.accuracy >= 90 ? 'var(--color-success)' :
                                session.accuracy >= 75 ? 'var(--color-warning)' : 'var(--color-error)'
                      }}
                    />
                  </svg>
                  <span className="sessions__accuracy-text">{session.accuracy}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
