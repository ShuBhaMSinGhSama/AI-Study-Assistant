// src/components/DashboardLayout.js

import SidebarNav from './SidebarNav';
import HeaderBar from './HeaderBar';
import WidgetCard from './WidgetCard'; // Import the new card component

function DashboardLayout() {
  return (
    // Main flex container for the entire screen (Sidebar + Main Content)
    <div className="dashboard-layout" style={{ display: 'flex', minHeight: '100vh', background: '#f8f9fa' }}>
      <SidebarNav />

      <main className="main-content" style={{ flex: 1, padding: '1.5rem 2.5rem' }}>
        <HeaderBar />

        {/* The Widget Grid: using CSS Grid for a responsive, modular layout */}
        <div className="widget-grid" style={{ 
            display: 'grid', 
            // Creates responsive columns: min width 320px, max 1 fraction unit
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
            gap: '1.5rem', 
            marginTop: '2rem' 
        }}>
          {/* 1. Doubt Solver Widget (The first MVP feature) [cite: 19] */}
          <WidgetCard title="🧠 Ask a Doubt">
            <p>Type your academic question below and get an instant AI explanation.</p>
            <input type="text" placeholder="e.g., What is mitosis?" style={{ width: '100%', padding: '10px' }}/>
          </WidgetCard>

          {/* 2. Notes Summarizer Widget */}
          <WidgetCard title="📑 Notes Summarizer">
            <p>Upload your PDF/notes to get key concepts instantly.</p>
            <button>Upload Notes</button>
          </WidgetCard>
          
          {/* 3. Smart Quiz Generator Widget */}
          <WidgetCard title="📝 Smart Quiz">
            <p>Start a practice quiz based on your latest study material.</p>
            <button>Start Quiz</button>
          </WidgetCard>

          {/* 4. Progress Tracker Widget */}
          <WidgetCard title="📈 Progress Tracker">
            <p>You have covered 75% of Biology. Revise Chemistry next!</p>
          </WidgetCard>
          
          {/* 5. Quick Revision Widget */}
          <WidgetCard title="💡 Quick Revision">
            <p>Formula of acceleration: a = (v - u) / t</p>
          </WidgetCard>
          
        </div>
      </main>
    </div>
  );
}

export default DashboardLayout;