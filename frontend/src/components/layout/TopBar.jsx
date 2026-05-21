import { useLocation } from 'react-router-dom'
import './TopBar.css'

const pageTitles = {
  '/': 'Dashboard',
  '/chat': 'AI Chat',
  '/materials': 'Study Materials',
  '/flashcards': 'Flashcards',
  '/sessions': 'Study Sessions',
}

export default function TopBar({ onMobileMenuToggle, sidebarCollapsed }) {
  const location = useLocation()
  const pageTitle = pageTitles[location.pathname] || 'AI Study Assistant'

  return (
    <header className={`topbar ${sidebarCollapsed ? 'topbar--sidebar-collapsed' : ''}`}>
      <div className="topbar__left">
        {/* Mobile hamburger */}
        <button className="topbar__hamburger show-mobile-only" onClick={onMobileMenuToggle} aria-label="Toggle menu">
          <span className="topbar__hamburger-line" />
          <span className="topbar__hamburger-line" />
          <span className="topbar__hamburger-line" />
        </button>

        <div className="topbar__title-area">
          <h1 className="topbar__title">{pageTitle}</h1>
          <p className="topbar__breadcrumb">
            <span className="topbar__breadcrumb-home">Home</span>
            <span className="topbar__breadcrumb-sep">/</span>
            <span className="topbar__breadcrumb-current">{pageTitle}</span>
          </p>
        </div>
      </div>

      <div className="topbar__right">
        {/* Search */}
        <div className="topbar__search hide-mobile">
          <span className="topbar__search-icon">🔍</span>
          <input
            type="text"
            className="topbar__search-input"
            placeholder="Search anything..."
          />
          <kbd className="topbar__search-kbd hide-mobile">⌘K</kbd>
        </div>

        {/* Notifications */}
        <button className="btn-icon topbar__notification" aria-label="Notifications">
          🔔
          <span className="topbar__notification-badge">3</span>
        </button>

        {/* Profile */}
        <div className="topbar__profile">
          <div className="topbar__profile-avatar">
            <span>S</span>
          </div>
        </div>
      </div>
    </header>
  )
}
