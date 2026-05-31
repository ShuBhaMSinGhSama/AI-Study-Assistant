import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import Chat from './pages/Chat'
import Materials from './pages/Materials'
import Flashcards from './pages/Flashcards'
import Sessions from './pages/Sessions'
import ReviewMode from './pages/ReviewMode'
import Login from './pages/Login'
import Register from './pages/Register'
import './App.css'

function App() {
  return (
    <Routes>
      {/* Public auth routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected app routes */}
      <Route element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route path="/" element={<Dashboard />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/materials" element={<Materials />} />
        <Route path="/flashcards" element={<Flashcards />} />
        <Route path="/sessions" element={<Sessions />} />
        <Route path="/review" element={<ReviewMode />} />
      </Route>
    </Routes>
  )
}

export default App
