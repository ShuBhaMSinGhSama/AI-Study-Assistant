import { useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './Sidebar.css'

const navItems = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/chat', label: 'AI Chat', icon: '💬' },
  { path: '/materials', label: 'Materials', icon: '📚' },
  { path: '/flashcards', label: 'Flashcards', icon: '🎴' },
  { path: '/review', label: 'Review', icon: '📖' },
  { path: '/sessions', label: 'Sessions', icon: '📈' },
]

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const displayName = user?.username || 'Student'
  const avatarInitial = displayName.charAt(0).toUpperCase()

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={onMobileClose} />
      )}

      <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''} ${mobileOpen ? 'sidebar--mobile-open' : ''}`}>
        {/* Logo Area */}
        <div className="sidebar__header">
          <div className="sidebar__logo">
            <div className="sidebar__logo-icon">
              <span className="sidebar__logo-emoji">🧠</span>
            </div>
            {!collapsed && (
              <div className="sidebar__logo-text">
                <span className="sidebar__brand">StudyAI</span>
                <span className="sidebar__brand-sub">Assistant</span>
              </div>
            )}
          </div>
          <button
            className="sidebar__toggle hide-on-mobile"
            onClick={onToggle}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? '▶' : '◀'}
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar__nav">
          <ul className="sidebar__nav-list">
            {navItems.map((item, index) => (
              <li key={item.path} className="sidebar__nav-item" style={{ animationDelay: `${index * 0.05}s` }}>
                <NavLink
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `sidebar__nav-link ${isActive ? 'sidebar__nav-link--active' : ''}`
                  }
                  onClick={onMobileClose}
                >
                  <span className="sidebar__nav-icon">{item.icon}</span>
                  {!collapsed && <span className="sidebar__nav-label">{item.label}</span>}
                  {!collapsed && location.pathname === item.path && (
                    <span className="sidebar__active-dot" />
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom Section */}
        <div className="sidebar__footer">
          <div className="sidebar__divider" />
          <div className="sidebar__user">
            <div className="sidebar__avatar">
              <span>{avatarInitial}</span>
            </div>
            {!collapsed && (
              <div className="sidebar__user-info">
                <span className="sidebar__user-name">{displayName}</span>
                <span className="sidebar__user-status">● Online</span>
              </div>
            )}
          </div>
          <button
            className="sidebar__logout-btn"
            onClick={handleLogout}
            title="Sign out"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: 'var(--radius-md, 0.5rem)',
              color: 'var(--text-secondary)',
              fontSize: '1.1rem',
              transition: 'color 0.2s, background 0.2s',
              marginLeft: collapsed ? 0 : 'auto',
            }}
            onMouseEnter={(e) => { e.target.style.color = '#ef4444'; e.target.style.background = 'rgba(239,68,68,0.1)' }}
            onMouseLeave={(e) => { e.target.style.color = 'var(--text-secondary)'; e.target.style.background = 'none' }}
          >
            🚪
          </button>
        </div>
      </aside>
    </>
  )
}

