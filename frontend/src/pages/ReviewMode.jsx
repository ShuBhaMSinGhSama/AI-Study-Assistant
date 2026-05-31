import { useState, useEffect } from 'react'
import { fetchDueFlashcards, reviewFlashcard } from '../services/api'
import './ReviewMode.css'

const QUALITY_OPTIONS = [
  { value: 0, label: 'Blackout', emoji: '😵', color: '#ef4444', desc: 'No idea' },
  { value: 1, label: 'Wrong', emoji: '😰', color: '#f97316', desc: 'Recognized after reveal' },
  { value: 2, label: 'Hard', emoji: '😓', color: '#eab308', desc: 'Wrong, but easy to recall' },
  { value: 3, label: 'Okay', emoji: '🤔', color: '#22c55e', desc: 'Correct with difficulty' },
  { value: 4, label: 'Good', emoji: '😊', color: '#06b6d4', desc: 'Correct, slight hesitation' },
  { value: 5, label: 'Perfect', emoji: '🤩', color: '#8b5cf6', desc: 'Instant recall' },
]

export default function ReviewMode() {
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [reviewing, setReviewing] = useState(false)
  const [sessionStats, setSessionStats] = useState({ reviewed: 0, correct: 0, total: 0 })
  const [sessionComplete, setSessionComplete] = useState(false)
  const [lastResult, setLastResult] = useState(null)

  useEffect(() => {
    loadDueCards()
  }, [])

  const loadDueCards = async () => {
    try {
      setLoading(true)
      const data = await fetchDueFlashcards()
      const dueCards = data.results || data
      setCards(dueCards)
      setSessionStats(prev => ({ ...prev, total: dueCards.length }))
      setCurrentIndex(0)
      setIsFlipped(false)
      setSessionComplete(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRate = async (quality) => {
    if (reviewing) return
    const card = cards[currentIndex]
    setReviewing(true)
    setLastResult(null)

    try {
      const result = await reviewFlashcard(card.id, quality)
      setLastResult(result)

      setSessionStats(prev => ({
        ...prev,
        reviewed: prev.reviewed + 1,
        correct: quality >= 3 ? prev.correct + 1 : prev.correct,
      }))

      // Move to next card after a brief delay
      setTimeout(() => {
        setIsFlipped(false)
        setLastResult(null)
        if (currentIndex + 1 < cards.length) {
          setCurrentIndex(prev => prev + 1)
        } else {
          setSessionComplete(true)
        }
        setReviewing(false)
      }, 1200)

    } catch (err) {
      alert('Failed to submit review: ' + err.message)
      setReviewing(false)
    }
  }

  const card = cards[currentIndex]
  const progress = cards.length > 0 ? ((currentIndex + (sessionComplete ? 1 : 0)) / cards.length) * 100 : 0

  // Loading
  if (loading) {
    return (
      <div className="review">
        <div className="review__loading animate-fade-in">
          <div className="review__loading-icon">⏳</div>
          <h2>Loading due cards...</h2>
        </div>
      </div>
    )
  }

  // Error
  if (error) {
    return (
      <div className="review">
        <div className="review__loading animate-fade-in">
          <div className="review__loading-icon">⚠️</div>
          <h2>Failed to load cards</h2>
          <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
          <button className="btn btn-primary" onClick={loadDueCards} style={{ marginTop: '1rem' }}>Retry</button>
        </div>
      </div>
    )
  }

  // No cards due
  if (cards.length === 0) {
    return (
      <div className="review">
        <div className="review__empty animate-scale-in">
          <div className="review__empty-icon">🎉</div>
          <h2>All caught up!</h2>
          <p>No cards are due for review right now. Great work!</p>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Cards will become due based on the spaced repetition schedule.
          </p>
        </div>
      </div>
    )
  }

  // Session complete
  if (sessionComplete) {
    const accuracy = sessionStats.reviewed > 0
      ? Math.round((sessionStats.correct / sessionStats.reviewed) * 100)
      : 0

    return (
      <div className="review">
        <div className="review__complete animate-scale-in">
          <div className="review__complete-icon">🏆</div>
          <h2>Review Session Complete!</h2>
          <div className="review__complete-stats">
            <div className="review__stat-card glass-card">
              <span className="review__stat-value">{sessionStats.reviewed}</span>
              <span className="review__stat-label">Cards Reviewed</span>
            </div>
            <div className="review__stat-card glass-card">
              <span className="review__stat-value">{sessionStats.correct}</span>
              <span className="review__stat-label">Correct</span>
            </div>
            <div className="review__stat-card glass-card">
              <span className="review__stat-value" style={{ color: accuracy >= 70 ? '#22c55e' : '#eab308' }}>{accuracy}%</span>
              <span className="review__stat-label">Accuracy</span>
            </div>
          </div>
          <button className="btn btn-primary" onClick={loadDueCards} style={{ marginTop: '1.5rem' }}>
            Review Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="review">
      {/* Header */}
      <div className="review__header animate-fade-in">
        <div>
          <h1 className="review__title">📖 Review Mode</h1>
          <p className="review__subtitle">
            Card {currentIndex + 1} of {cards.length} • {sessionStats.reviewed} reviewed
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="review__progress-container glass-card animate-fade-in stagger-1">
        <div className="review__progress-bar">
          <div
            className="review__progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="review__progress-text">{Math.round(progress)}%</span>
      </div>

      {/* Flashcard */}
      <div
        className={`review__card glass-card-strong animate-fade-in stagger-2 ${isFlipped ? 'review__card--flipped' : ''}`}
        onClick={() => !reviewing && setIsFlipped(!isFlipped)}
      >
        <div className="review__card-inner">
          <div className="review__card-front">
            <span className="review__card-label">QUESTION</span>
            <p className="review__card-text">{card?.question}</p>
            <span className="review__card-hint">Tap to reveal answer</span>
          </div>
          <div className="review__card-back">
            <span className="review__card-label">ANSWER</span>
            <p className="review__card-text">{card?.answer}</p>
          </div>
        </div>
      </div>

      {/* Rating Buttons */}
      {isFlipped && (
        <div className="review__rating animate-fade-in">
          <p className="review__rating-prompt">How well did you know this?</p>
          <div className="review__rating-grid">
            {QUALITY_OPTIONS.map(opt => (
              <button
                key={opt.value}
                className="review__rate-btn glass-card-interactive"
                onClick={() => handleRate(opt.value)}
                disabled={reviewing}
                style={{ '--accent': opt.color }}
              >
                <span className="review__rate-emoji">{opt.emoji}</span>
                <span className="review__rate-label">{opt.label}</span>
                <span className="review__rate-desc">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Result Toast */}
      {lastResult && (
        <div className="review__toast animate-fade-in">
          ✅ {lastResult.message}
        </div>
      )}
    </div>
  )
}
