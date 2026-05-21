import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Chat from './pages/Chat'
import Materials from './pages/Materials'
import Flashcards from './pages/Flashcards'
import Sessions from './pages/Sessions'
import './App.css'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/materials" element={<Materials />} />
        <Route path="/flashcards" element={<Flashcards />} />
        <Route path="/sessions" element={<Sessions />} />
      </Route>
    </Routes>
  )
}

export default App
