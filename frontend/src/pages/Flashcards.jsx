import { useState, useEffect } from 'react'
import { fetchFlashcards, createFlashcard, deleteFlashcard, updateFlashcard, fetchMaterials, generateFlashcards } from '../services/api'
import { showToast } from '../components/Toast'
import './Flashcards.css'

const difficultyColors = {
  easy: 'badge-emerald',
  medium: 'badge-warning',
  hard: 'badge-error',
}

export default function Flashcards() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [showAll, setShowAll] = useState(false)

  const [flashcards, setFlashcards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [createForm, setCreateForm] = useState({ question: '', answer: '', difficulty: 'medium' })
  const [creating, setCreating] = useState(false)

  const [materials, setMaterials] = useState([])
  const [selectedMaterialId, setSelectedMaterialId] = useState('')
  const [generating, setGenerating] = useState(false)
  const [numCards, setNumCards] = useState(10)

  // Pagination
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [hasNext, setHasNext] = useState(false)
  const [hasPrev, setHasPrev] = useState(false)

  useEffect(() => {
    loadFlashcards(page)
  }, [page])

  const loadFlashcards = async (pageNumber = 1) => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchFlashcards({ page: pageNumber })
      
      if (data.results) {
        setFlashcards(data.results)
        setHasNext(!!data.next)
        setHasPrev(!!data.previous)
        setTotalPages(Math.ceil(data.count / 50)) // 50 is DRF PAGE_SIZE
      } else {
        setFlashcards(data)
        setHasNext(false)
        setHasPrev(false)
        setTotalPages(1)
      }
      setCurrentIndex(0)
      setIsFlipped(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const card = flashcards[currentIndex] || {}
  const total = flashcards.length
  const progress = total > 0 ? ((currentIndex + 1) / total) * 100 : 0

  const goNext = () => {
    if (currentIndex < total - 1) {
      setIsFlipped(false)
      setTimeout(() => setCurrentIndex(prev => prev + 1), 200)
    }
  }

  const goPrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false)
      setTimeout(() => setCurrentIndex(prev => prev - 1), 200)
    }
  }

  const flipCard = () => {
    setIsFlipped(prev => !prev)
  }

  const rateCard = async (difficulty) => {
    const c = flashcards[currentIndex]
    if (!c) return
    try {
      await updateFlashcard(c.id, {
        difficulty,
        times_reviewed: (c.times_reviewed || 0) + 1,
        last_reviewed: new Date().toISOString(),
      })
      setFlashcards(prev => prev.map((fc, i) =>
        i === currentIndex ? { ...fc, difficulty, times_reviewed: (fc.times_reviewed || 0) + 1 } : fc
      ))
      // Auto-advance to next card
      if (currentIndex < flashcards.length - 1) {
        setIsFlipped(false)
        setTimeout(() => setCurrentIndex(prev => prev + 1), 300)
      }
    } catch (err) {
      showToast('Failed to update: ' + err.message, 'error')
    }
  }

  const handleDeleteCard = async (id, e) => {
    if (e) e.stopPropagation()
    if (!window.confirm('Delete this flashcard?')) return
    try {
      await deleteFlashcard(id)
      setFlashcards(prev => prev.filter(fc => fc.id !== id))
      if (currentIndex >= flashcards.length - 1 && currentIndex > 0) {
        setCurrentIndex(prev => prev - 1)
      }
    } catch (err) {
      showToast('Failed to delete: ' + err.message, 'error')
    }
  }

  const handleCreateCard = async (e) => {
    e.preventDefault()
    setCreating(true)
    try {
      await createFlashcard(createForm)
      setShowCreateModal(false)
      setCreateForm({ question: '', answer: '', difficulty: 'medium' })
      loadFlashcards()
    } catch (err) {
      showToast('Failed to create: ' + err.message, 'error')
    } finally {
      setCreating(false)
    }
  }

  const handleGenerate = async (e) => {
    e.preventDefault()
    setGenerating(true)
    try {
      const result = await generateFlashcards(selectedMaterialId, numCards)
      setShowGenerateModal(false)
      setSelectedMaterialId('')
      loadFlashcards()
      showToast(`Successfully generated ${result.generated || result.count || numCards} flashcards!`, 'success')
    } catch (err) {
      showToast('Failed to generate: ' + err.message, 'error')
    } finally {
      setGenerating(false)
    }
  }

  const openGenerateModal = async () => {
    try {
      const matData = await fetchMaterials()
      setMaterials(matData.results || matData)
    } catch (e) { /* ignore */ }
    setShowGenerateModal(true)
  }

  // Loading state
  if (loading) {
    return (
      <div className="flashcards">
        <div className="flashcards__header animate-fade-in">
          <div>
            <h1 className="flashcards__title">Flashcards</h1>
            <p className="flashcards__subtitle">Review and test your knowledge</p>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
          <div className="loading-spinner" />
          <span style={{ marginLeft: '1rem', color: 'var(--text-secondary)' }}>Loading flashcards...</span>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flashcards">
        <div className="flashcards__header animate-fade-in">
          <div>
            <h1 className="flashcards__title">Flashcards</h1>
            <p className="flashcards__subtitle">Review and test your knowledge</p>
          </div>
        </div>
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem', marginTop: '2rem' }}>
          <p style={{ color: 'var(--color-error)', fontSize: '1.125rem', marginBottom: '1rem' }}>⚠️ {error}</p>
          <button className="btn btn-primary" onClick={loadFlashcards}>Retry</button>
        </div>
      </div>
    )
  }

  return (
    <div className="flashcards">
      {/* Header */}
      <div className="flashcards__header animate-fade-in">
        <div>
          <h1 className="flashcards__title">Flashcards</h1>
          <p className="flashcards__subtitle">Review and test your knowledge</p>
        </div>
        <div className="flashcards__header-actions">
          {total > 0 && (
            <button
              className={`btn ${showAll ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? '🎴 Study Mode' : '📋 View All'}
            </button>
          )}
          <button className="btn btn-secondary" onClick={openGenerateModal}>🤖 Generate from AI</button>
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>+ Create Card</button>
        </div>
      </div>

      {total === 0 ? (
        /* ── Empty State ── */
        <div className="glass-card animate-fade-in-up stagger-1" style={{ textAlign: 'center', padding: '4rem 2rem', marginTop: '2rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🃏</div>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No flashcards yet</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Create your first flashcard or generate them from your study materials using AI.</p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>+ Create Card</button>
            <button className="btn btn-secondary" onClick={openGenerateModal}>🤖 Generate from AI</button>
          </div>
        </div>
      ) : !showAll ? (
        /* ── Study Mode ── */
        <div className="flashcards__study animate-fade-in-up stagger-1">
          {/* Progress Bar */}
          <div className="flashcards__progress-area">
            <div className="flashcards__progress-info">
              <span className="flashcards__counter">
                Card <strong>{currentIndex + 1}</strong> of <strong>{total}</strong>
              </span>
              <span className={`badge ${difficultyColors[card.difficulty] || 'badge-warning'}`}>
                {card.difficulty || 'medium'}
              </span>
            </div>
            <div className="flashcards__progress-bar">
              <div
                className="flashcards__progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
            {card.times_reviewed != null && (
              <span className="badge badge-primary">Reviewed {card.times_reviewed}×</span>
            )}
          </div>

          {/* Card */}
          <div className="flashcards__card-container" onClick={flipCard}>
            <div className={`flashcards__card ${isFlipped ? 'flashcards__card--flipped' : ''}`}>
              <div className="flashcards__card-face flashcards__card-front">
                <span className="flashcards__card-label">QUESTION</span>
                <p className="flashcards__card-text">{card.question}</p>
                <span className="flashcards__card-hint">Click to reveal answer</span>
              </div>
              <div className="flashcards__card-face flashcards__card-back">
                <span className="flashcards__card-label">ANSWER</span>
                <p className="flashcards__card-text">{card.answer}</p>
                <span className="flashcards__card-hint">Click to see question</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flashcards__nav">
            <button
              className="flashcards__nav-btn"
              onClick={goPrev}
              disabled={currentIndex === 0}
            >
              ← Previous
            </button>
            <div className="flashcards__dots">
              {flashcards.map((_, i) => (
                <button
                  key={i}
                  className={`flashcards__dot ${i === currentIndex ? 'active' : ''}`}
                  onClick={() => { setIsFlipped(false); setCurrentIndex(i) }}
                />
              ))}
            </div>
            <button
              className="flashcards__nav-btn"
              onClick={goNext}
              disabled={currentIndex === total - 1}
            >
              Next →
            </button>
          </div>

          {/* Difficulty Rating */}
          <div className="flashcards__rating">
            <span className="flashcards__rating-label">How did you do?</span>
            <div className="flashcards__rating-btns">
              <button className="flashcards__rate-btn flashcards__rate-btn--hard" onClick={() => rateCard('hard')}>😰 Hard</button>
              <button className="flashcards__rate-btn flashcards__rate-btn--medium" onClick={() => rateCard('medium')}>🤔 Medium</button>
              <button className="flashcards__rate-btn flashcards__rate-btn--easy" onClick={() => rateCard('easy')}>😊 Easy</button>
            </div>
          </div>
        </div>
      ) : (
        /* ── All Cards View ── */
        <div className="flashcards__grid">
          {flashcards.map((fc, index) => (
            <div
              key={fc.id}
              className={`flashcards__grid-card glass-card-interactive animate-fade-in-up stagger-${Math.min(index + 1, 8)}`}
              onClick={() => { setCurrentIndex(index); setShowAll(false); setIsFlipped(false) }}
            >
              <div className="flashcards__grid-card-header">
                <span className={`badge ${difficultyColors[fc.difficulty] || 'badge-warning'}`}>{fc.difficulty || 'medium'}</span>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', minWidth: 'auto' }}
                  onClick={(e) => handleDeleteCard(fc.id, e)}
                  title="Delete card"
                >
                  🗑️
                </button>
              </div>
              <p className="flashcards__grid-card-question">{fc.question}</p>
              <span className="flashcards__grid-card-cta">Click to study →</span>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && !error && totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
          <button 
            className="btn btn-secondary" 
            disabled={!hasPrev} 
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            ← Previous
          </button>
          <span style={{ alignSelf: 'center', color: 'var(--text-secondary)' }}>
            Page {page} of {totalPages}
          </span>
          <button 
            className="btn btn-secondary" 
            disabled={!hasNext} 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          >
            Next →
          </button>
        </div>
      )}

      {/* ── Create Flashcard Modal ── */}
      {showCreateModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => setShowCreateModal(false)}>
          <div className="glass-card-strong" onClick={e => e.stopPropagation()} style={{
            width: '100%', maxWidth: '500px', padding: '2rem',
            borderRadius: 'var(--radius-xl)', margin: '1rem'
          }}>
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Create Flashcard</h2>
            <form onSubmit={handleCreateCard} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <textarea className="input-glass" placeholder="Question" value={createForm.question} onChange={e => setCreateForm(p => ({...p, question: e.target.value}))} rows={3} required style={{ width: '100%', resize: 'vertical' }} />
              <textarea className="input-glass" placeholder="Answer" value={createForm.answer} onChange={e => setCreateForm(p => ({...p, answer: e.target.value}))} rows={3} required style={{ width: '100%', resize: 'vertical' }} />
              <select className="input-glass" value={createForm.difficulty} onChange={e => setCreateForm(p => ({...p, difficulty: e.target.value}))} style={{ width: '100%' }}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={creating}>{creating ? 'Creating...' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Generate Flashcards Modal ── */}
      {showGenerateModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => setShowGenerateModal(false)}>
          <div className="glass-card-strong" onClick={e => e.stopPropagation()} style={{
            width: '100%', maxWidth: '500px', padding: '2rem',
            borderRadius: 'var(--radius-xl)', margin: '1rem'
          }}>
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>🤖 Generate Flashcards with AI</h2>
            <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Select Study Material</label>
              <select className="input-glass" value={selectedMaterialId} onChange={e => setSelectedMaterialId(e.target.value)} required style={{ width: '100%' }}>
                <option value="">Choose a material...</option>
                {materials.map(m => (
                  <option key={m.id} value={m.id}>{m.title}</option>
                ))}
              </select>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Number of cards</label>
              <input type="number" className="input-glass" min={1} max={30} value={numCards} onChange={e => setNumCards(parseInt(e.target.value) || 10)} style={{ width: '100%' }} />
              {materials.length === 0 && (
                <p style={{ color: 'var(--color-warning)', fontSize: '0.875rem' }}>No materials found. Upload study materials first!</p>
              )}
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowGenerateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={generating || !selectedMaterialId}>{generating ? 'Generating...' : 'Generate'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
