import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchStatus, fetchDashboardStats, fetchActivityFeed } from '../services/api'
import { useAuth } from '../context/AuthContext'
import './Dashboard.css'

const quickActions = [
  {
    id: 1,
    icon: '💬',
    title: 'Start AI Chat',
    description: 'Ask questions about your study materials and get instant AI-powered answers.',
    gradient: 'var(--accent-gradient)',
    path: '/chat',
  },
  {
    id: 2,
    icon: '📤',
    title: 'Upload Material',
    description: 'Add PDFs, notes, or links to your study library for AI processing.',
    gradient: 'var(--emerald-gradient)',
    path: '/materials',
  },
  {
    id: 3,
    icon: '🎴',
    title: 'Review Flashcards',
    description: 'Practice with AI-generated flashcards and track your progress.',
    gradient: 'var(--cool-gradient)',
    path: '/flashcards',
  },
]

/**
 * Build the 4 stat-card objects from the dashboard API response.
 * Falls back to all-zero values when stats is null (loading / error).
 */
function buildStatsData(stats) {
  const s = stats || { total_materials: 0, total_flashcards: 0, total_sessions: 0, total_chat_messages: 0 }
  return [
    { id: 1, icon: '📚', count: s.total_materials,     label: 'Total Materials' },
    { id: 2, icon: '🎴', count: s.total_flashcards,    label: 'Flashcards Created' },
    { id: 3, icon: '⏱️', count: s.total_sessions,      label: 'Study Sessions' },
    { id: 4, icon: '💬', count: s.total_chat_messages,  label: 'Chat Messages' },
  ]
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [backendStatus, setBackendStatus] = useState(null)
  const [statusLoading, setStatusLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [recentActivity, setRecentActivity] = useState([])
  const [activityLoading, setActivityLoading] = useState(true)

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const data = await fetchStatus()
        setBackendStatus(data)
      } catch {
        setBackendStatus(null)
      } finally {
        setStatusLoading(false)
      }
    }

    const loadDashboard = async () => {
      try {
        const dashData = await fetchDashboardStats()
        setStats(dashData)
      } catch {
        setStats(null)
      } finally {
        setStatsLoading(false)
      }
    }

    const loadActivityFeed = async () => {
      try {
        const data = await fetchActivityFeed()
        setRecentActivity(data.activities || [])
      } catch {
        setRecentActivity([])
      } finally {
        setActivityLoading(false)
      }
    }

    checkStatus()
    loadDashboard()
    loadActivityFeed()
  }, [])

  const statsData = buildStatsData(stats)

  return (
    <div className="dashboard">
      {/* Welcome Header */}
      <div className="dashboard__welcome animate-fade-in">
        <div className="dashboard__welcome-text">
          <h1 className="dashboard__greeting">
            Welcome back, <span className="gradient-text">{user?.username || 'Student'}</span> 👋
          </h1>
          <p className="dashboard__subtitle">
            Here&apos;s your learning progress overview. Keep up the great work!
          </p>
        </div>
        <div className="dashboard__status-chip">
          <span className={`dashboard__status-dot ${statusLoading ? 'loading' : backendStatus ? '' : 'error'}`} />
          <span className="dashboard__status-text">
            {statusLoading ? 'Connecting...' : backendStatus ? 'Backend Online' : 'Backend Offline'}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="dashboard__stats">
        {statsData.map((stat, index) => (
          <div
            key={stat.id}
            className={`dashboard__stat-card glass-card animate-fade-in-up stagger-${index + 1}`}
          >
            <div className="dashboard__stat-header">
              <span className="dashboard__stat-icon">{stat.icon}</span>
              {statsLoading && (
                <span className="dashboard__stat-trend up" style={{ opacity: 0.4 }}>
                  …
                </span>
              )}
            </div>
            <div className="dashboard__stat-count" style={statsLoading ? { opacity: 0.4 } : undefined}>
              {stat.count}
            </div>
            <div className="dashboard__stat-label">{stat.label}</div>
            <div className="dashboard__stat-bar">
              <div
                className="dashboard__stat-bar-fill"
                style={{ width: `${Math.min(stat.count / 2, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <section className="dashboard__section animate-fade-in stagger-5">
        <h2 className="dashboard__section-title">Quick Actions</h2>
        <div className="dashboard__actions">
          {quickActions.map((action) => (
            <button
              key={action.id}
              className="dashboard__action-card glass-card-interactive"
              onClick={() => navigate(action.path)}
            >
              <div className="dashboard__action-icon-wrap" style={{ background: action.gradient }}>
                <span className="dashboard__action-icon">{action.icon}</span>
              </div>
              <h3 className="dashboard__action-title">{action.title}</h3>
              <p className="dashboard__action-desc">{action.description}</p>
              <span className="dashboard__action-arrow">→</span>
            </button>
          ))}
        </div>
      </section>

      {/* Recent Activity */}
      <section className="dashboard__section animate-fade-in stagger-6">
        <h2 className="dashboard__section-title">Recent Activity</h2>
        <div className="dashboard__activity glass-card">
          {activityLoading ? (
            <div className="dashboard__activity-empty" style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
              Loading activity feed...
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="dashboard__activity-empty" style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
              No recent activity found. Start studying to see your feed!
            </div>
          ) : (
            recentActivity.map((item, index) => (
              <div key={item.id} className="dashboard__activity-item" style={{ animationDelay: `${index * 0.06}s` }}>
                <div className="dashboard__activity-icon" style={{ background: `${item.color}22`, color: item.color }}>
                  {item.icon}
                </div>
                <div className="dashboard__activity-content">
                  <p className="dashboard__activity-text">{item.text}</p>
                  <span className="dashboard__activity-time">{item.time}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
