function HeaderBar() {
  return (
    <header className="header-bar">
      {/* Welcome Message */}
      <div className="welcome-message">
        Hi, Alex! 
      </div>
      
      {/* Date, Notifications, and Settings */}
      <div className="header-right">
        {/* Current Date */}
        <span>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
        {/* Placeholder for Notifications Button */}
        <button className="icon-button">{/* <FaBell /> */}</button> 
        {/* Placeholder for Settings Button */}
        <button className="icon-button">{/* <FaCog /> */}</button> 
      </div>
    </header>
  );
}

export default HeaderBar;