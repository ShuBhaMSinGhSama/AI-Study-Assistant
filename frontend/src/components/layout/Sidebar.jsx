import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import './Sidebar.css'

const navItems = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/chat', label: 'AI Chat', icon: '💬' },
  { path: '/materials', label: 'Materials', icon: '📚' },
  { path: '/flashcards', label: 'Flashcards', icon: '🎴' },
  { path: '/sessions', label: 'Sessions', icon: '📈' },
]

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  const location = useLocation()

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
              <span>S</span>
            </div>
            {!collapsed && (
              <div className="sidebar__user-info">
                <span className="sidebar__user-name">Student</span>
                <span className="sidebar__user-status">● Online</span>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
