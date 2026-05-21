import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchStatus } from '../services/api'
import './Dashboard.css'

// Mock data
const statsData = [
  { id: 1, icon: '📚', count: 24, label: 'Total Materials', trend: '+3', trendUp: true },
  { id: 2, icon: '🎴', count: 156, label: 'Flashcards Created', trend: '+12', trendUp: true },
  { id: 3, icon: '⏱️', count: 47, label: 'Study Hours', trend: '+5.2', trendUp: true },
  { id: 4, icon: '💬', count: 38, label: 'Chat Sessions', trend: '+8', trendUp: true },
]

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

const recentActivity = [
  { id: 1, icon: '📄', text: 'Uploaded "Machine Learning Chapter 5.pdf"', time: '2 min ago', color: 'var(--accent-primary)' },
  { id: 2, icon: '🎴', text: 'Created 8 flashcards for Neural Networks', time: '15 min ago', color: 'var(--accent-secondary)' },
  { id: 3, icon: '💬', text: 'AI chat session on Linear Algebra', time: '1 hour ago', color: 'var(--accent-emerald)' },
  { id: 4, icon: '✅', text: 'Completed flashcard review — 92% accuracy', time: '3 hours ago', color: 'var(--color-success)' },
  { id: 5, icon: '📈', text: 'Study session: 45 min on Data Structures', time: '5 hours ago', color: 'var(--color-info)' },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const [backendStatus, setBackendStatus] = useState(null)
  const [statusLoading, setStatusLoading] = useState(true)

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
    checkStatus()
  }, [])

  return (
    <div className="dashboard">
      {/* Welcome Header */}
      <div className="dashboard__welcome animate-fade-in">
        <div className="dashboard__welcome-text">
          <h1 className="dashboard__greeting">
            Welcome back, <span className="gradient-text">Student</span> 👋
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
              <span className={`dashboard__stat-trend ${stat.trendUp ? 'up' : 'down'}`}>
                {stat.trendUp ? '↑' : '↓'} {stat.trend}
              </span>
            </div>
            <div className="dashboard__stat-count">{stat.count}</div>
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
          {recentActivity.map((item, index) => (
            <div key={item.id} className="dashboard__activity-item" style={{ animationDelay: `${index * 0.06}s` }}>
              <div className="dashboard__activity-icon" style={{ background: `${item.color}22`, color: item.color }}>
                {item.icon}
              </div>
              <div className="dashboard__activity-content">
                <p className="dashboard__activity-text">{item.text}</p>
                <span className="dashboard__activity-time">{item.time}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
