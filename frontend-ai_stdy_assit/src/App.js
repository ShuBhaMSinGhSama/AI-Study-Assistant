// src/App.js
import './App.css'; // Keep or remove, depending on your styling choice
import SidebarNav from './components/SidebarNav'; 

function App() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <SidebarNav /> 
      {/* Main content area will go next to this component */}
      <main style={{ flex: 1, padding: '2rem' }}>
          <h1>Welcome to your AI Study Assistant!</h1>
          <p>The sidebar is working!</p>
      </main>
    </div>
  );
}

export default App;