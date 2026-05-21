import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import './Layout.css'

export default function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const toggleSidebar = () => setSidebarCollapsed(prev => !prev)
  const toggleMobileMenu = () => setMobileMenuOpen(prev => !prev)
  const closeMobileMenu = () => setMobileMenuOpen(false)

  return (
    <div className="layout">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
        mobileOpen={mobileMenuOpen}
        onMobileClose={closeMobileMenu}
      />

      <TopBar
        onMobileMenuToggle={toggleMobileMenu}
        sidebarCollapsed={sidebarCollapsed}
      />

      <main className={`layout__main ${sidebarCollapsed ? 'layout__main--sidebar-collapsed' : ''}`}>
        <div className="layout__content">
          <Outlet />
        </div>
      </main>

      {/* Background decorative orbs */}
      <div className="layout__bg-orb layout__bg-orb--1" />
      <div className="layout__bg-orb layout__bg-orb--2" />
      <div className="layout__bg-orb layout__bg-orb--3" />
    </div>
  )
}
