function WidgetCard({ title, children }) {
  return (
    // 'widget-card' class for styling (background, border-radius, shadow)
    <div className="widget-card" style={{ 
        padding: '1.5rem', 
        borderRadius: '12px', 
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)', 
        backgroundColor: '#fff',
        // Example sizing for grid items: 350px width, flex for responsiveness
        minWidth: '320px', 
        flex: 1 
    }}>
      {/* Card Title */}
      <h2>{title}</h2>
      
      {/* Card Content (passed as children) */}
      <div className="card-content">
        {children}
      </div>
    </div>
  );
}

export default WidgetCard;