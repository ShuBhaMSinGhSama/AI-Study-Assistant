import { useState } from 'react'
import './Flashcards.css'

const mockFlashcards = [
  { id: 1, question: 'What is the time complexity of binary search?', answer: 'O(log n) — Binary search halves the search space with each comparison, making it logarithmic in time complexity.', difficulty: 'Easy', category: 'Algorithms' },
  { id: 2, question: 'Explain the concept of backpropagation in neural networks.', answer: 'Backpropagation is an algorithm for training neural networks. It calculates the gradient of the loss function with respect to each weight by applying the chain rule, propagating the error backwards through the network to update weights.', difficulty: 'Hard', category: 'Machine Learning' },
  { id: 3, question: 'What is a hash table and what is its average time complexity for search?', answer: 'A hash table is a data structure that maps keys to values using a hash function. Average time complexity for search is O(1), but worst case is O(n) due to collisions.', difficulty: 'Medium', category: 'Data Structures' },
  { id: 4, question: 'Define the Central Limit Theorem.', answer: 'The Central Limit Theorem states that the distribution of sample means approximates a normal distribution as the sample size becomes larger, regardless of the population distribution shape, given a sufficiently large sample size (typically n ≥ 30).', difficulty: 'Medium', category: 'Statistics' },
  { id: 5, question: 'What is polymorphism in object-oriented programming?', answer: 'Polymorphism allows objects of different types to be treated as instances of a common parent type. It enables a single interface to represent different underlying forms (data types), achieved through method overriding and interfaces.', difficulty: 'Easy', category: 'OOP' },
  { id: 6, question: 'Explain the difference between TCP and UDP.', answer: 'TCP (Transmission Control Protocol) is connection-oriented, ensures reliable delivery with error checking and ordering. UDP (User Datagram Protocol) is connectionless, faster but unreliable — no guarantee of delivery, ordering, or duplicate protection.', difficulty: 'Medium', category: 'Networking' },
  { id: 7, question: 'What is gradient descent and why is it important?', answer: 'Gradient descent is an optimization algorithm used to minimize a function by iteratively moving in the direction of steepest descent (negative gradient). It is fundamental to training machine learning models, finding optimal parameters by minimizing the loss function.', difficulty: 'Hard', category: 'Machine Learning' },
]

const difficultyColors = {
  Easy: 'badge-emerald',
  Medium: 'badge-warning',
  Hard: 'badge-error',
}

export default function Flashcards() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [showAll, setShowAll] = useState(false)

  const card = mockFlashcards[currentIndex]
  const total = mockFlashcards.length
  const progress = ((currentIndex + 1) / total) * 100

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

  return (
    <div className="flashcards">
      {/* Header */}
      <div className="flashcards__header animate-fade-in">
        <div>
          <h1 className="flashcards__title">Flashcards</h1>
          <p className="flashcards__subtitle">Review and test your knowledge</p>
        </div>
        <div className="flashcards__header-actions">
          <button
            className={`btn ${showAll ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? '🎴 Study Mode' : '📋 View All'}
          </button>
          <button className="btn btn-primary">+ Create Card</button>
        </div>
      </div>

      {!showAll ? (
        /* ── Study Mode ── */
        <div className="flashcards__study animate-fade-in-up stagger-1">
          {/* Progress Bar */}
          <div className="flashcards__progress-area">
            <div className="flashcards__progress-info">
              <span className="flashcards__counter">
                Card <strong>{currentIndex + 1}</strong> of <strong>{total}</strong>
              </span>
              <span className={`badge ${difficultyColors[card.difficulty]}`}>
                {card.difficulty}
              </span>
            </div>
            <div className="flashcards__progress-bar">
              <div
                className="flashcards__progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="flashcards__category badge badge-primary">{card.category}</span>
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
              {mockFlashcards.map((_, i) => (
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
              <button className="flashcards__rate-btn flashcards__rate-btn--hard">😰 Hard</button>
              <button className="flashcards__rate-btn flashcards__rate-btn--medium">🤔 Medium</button>
              <button className="flashcards__rate-btn flashcards__rate-btn--easy">😊 Easy</button>
            </div>
          </div>
        </div>
      ) : (
        /* ── All Cards View ── */
        <div className="flashcards__grid">
          {mockFlashcards.map((fc, index) => (
            <div
              key={fc.id}
              className={`flashcards__grid-card glass-card-interactive animate-fade-in-up stagger-${Math.min(index + 1, 8)}`}
              onClick={() => { setCurrentIndex(index); setShowAll(false); setIsFlipped(false) }}
            >
              <div className="flashcards__grid-card-header">
                <span className={`badge ${difficultyColors[fc.difficulty]}`}>{fc.difficulty}</span>
                <span className="badge badge-primary">{fc.category}</span>
              </div>
              <p className="flashcards__grid-card-question">{fc.question}</p>
              <span className="flashcards__grid-card-cta">Click to study →</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
