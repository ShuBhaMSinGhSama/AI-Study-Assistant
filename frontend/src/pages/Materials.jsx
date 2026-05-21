import { useState } from 'react'
import './Materials.css'

const mockMaterials = [
  { id: 1, title: 'Machine Learning Chapter 5', type: 'PDF', preview: 'Neural networks, backpropagation, and gradient descent fundamentals...', date: '2024-01-15', size: '2.4 MB' },
  { id: 2, title: 'Data Structures Notes', type: 'Note', preview: 'Binary trees, heaps, hash tables, and graph algorithms overview...', date: '2024-01-14', size: '156 KB' },
  { id: 3, title: 'Linear Algebra Reference', type: 'PDF', preview: 'Matrix operations, eigenvalues, vector spaces, and transformations...', date: '2024-01-13', size: '5.1 MB' },
  { id: 4, title: 'Python Best Practices', type: 'Link', preview: 'Comprehensive guide to writing clean, efficient Python code...', date: '2024-01-12', size: '—' },
  { id: 5, title: 'Statistics Formulas', type: 'Note', preview: 'Probability distributions, hypothesis testing, regression analysis...', date: '2024-01-11', size: '89 KB' },
  { id: 6, title: 'Algorithm Design Manual', type: 'PDF', preview: 'Divide and conquer, dynamic programming, greedy algorithms...', date: '2024-01-10', size: '8.7 MB' },
]

const typeIcons = { PDF: '📄', Note: '📝', Link: '🔗' }
const typeBadgeClass = { PDF: 'badge-error', Note: 'badge-primary', Link: 'badge-emerald' }

export default function Materials() {
  const [viewMode, setViewMode] = useState('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [dragOver, setDragOver] = useState(false)

  const filtered = mockMaterials.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' || m.type === filterType
    return matchesSearch && matchesType
  })

  return (
    <div className="materials">
      {/* Header */}
      <div className="materials__header animate-fade-in">
        <div>
          <h1 className="materials__title">Study Materials</h1>
          <p className="materials__subtitle">Manage your uploaded documents, notes, and links</p>
        </div>
        <button className="btn btn-primary">
          <span>+</span> Upload Material
        </button>
      </div>

      {/* Toolbar */}
      <div className="materials__toolbar glass-card animate-fade-in stagger-1">
        <div className="materials__search">
          <span className="materials__search-icon">🔍</span>
          <input
            type="text"
            className="materials__search-input"
            placeholder="Search materials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="materials__filters">
          {['all', 'PDF', 'Note', 'Link'].map(type => (
            <button
              key={type}
              className={`materials__filter-btn ${filterType === type ? 'active' : ''}`}
              onClick={() => setFilterType(type)}
            >
              {type === 'all' ? 'All' : `${typeIcons[type]} ${type}`}
            </button>
          ))}
        </div>

        <div className="materials__view-toggle">
          <button
            className={`materials__view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            aria-label="Grid view"
          >
            ⊞
          </button>
          <button
            className={`materials__view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            aria-label="List view"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Upload Area */}
      <div
        className={`materials__upload-zone animate-fade-in stagger-2 ${dragOver ? 'materials__upload-zone--active' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false) }}
      >
        <div className="materials__upload-icon">📤</div>
        <p className="materials__upload-title">Drop files here to upload</p>
        <p className="materials__upload-hint">or click to browse · PDF, TXT, MD supported</p>
      </div>

      {/* Materials Grid/List */}
      <div className={`materials__grid ${viewMode === 'list' ? 'materials__grid--list' : ''}`}>
        {filtered.map((material, index) => (
          <div
            key={material.id}
            className={`materials__card glass-card-interactive animate-fade-in-up stagger-${Math.min(index + 3, 8)}`}
          >
            <div className="materials__card-header">
              <span className="materials__card-icon">{typeIcons[material.type]}</span>
              <span className={`badge ${typeBadgeClass[material.type]}`}>{material.type}</span>
            </div>
            <h3 className="materials__card-title">{material.title}</h3>
            <p className="materials__card-preview">{material.preview}</p>
            <div className="materials__card-footer">
              <span className="materials__card-date">{material.date}</span>
              <span className="materials__card-size">{material.size}</span>
            </div>
            <div className="materials__card-actions">
              <button className="btn-icon" title="View">👁</button>
              <button className="btn-icon" title="Chat about">💬</button>
              <button className="btn-icon" title="Delete">🗑</button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="materials__empty animate-fade-in">
          <span className="materials__empty-icon">📭</span>
          <h3>No materials found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  )
}
