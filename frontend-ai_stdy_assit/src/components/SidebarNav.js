
function SidebarNav() {
  return (
    <aside className="sidebar">
      {/* App Logo/Title */}
      <div className="logo">StudyAI</div>
      
      {/* Navigation Links */}
      <nav>
        <ul>
          <li>{/* <FaHome /> */} Dashboard</li>
          <li>{/* <FaQuestion /> */} Doubt Solver</li>
          <li>{/* <FaBook /> */} Notes Summarizer</li>
          <li>{/* <FaChartBar /> */} Quiz Generator</li>
          <li>{/* <FaCalendarAlt /> */} Study Planner</li>
          <li>{/* <FaUserCircle /> */} Profile</li>
        </ul>
      </nav>
      
      {/* Theme Toggle and User Info */}
      <footer className="sidebar-footer">
        {/* Replace with actual theme toggle button */}
        <span>Theme Toggle</span>
        {/* Replace with small user avatar */}
        <span>User Avatar</span> 
      </footer>
    </aside>
  );
}

export default SidebarNav;