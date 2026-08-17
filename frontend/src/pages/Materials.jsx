import { useState, useEffect } from 'react'
import { fetchMaterials, createMaterial, deleteMaterial } from '../services/api'
import { showToast } from '../components/Toast'
import './Materials.css'

const typeIcons = { pdf: '📄', note: '📝', link: '🔗' }
const typeBadgeClass = { pdf: 'badge-error', note: 'badge-primary', link: 'badge-emerald' }

export default function Materials() {
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [viewMode, setViewMode] = useState('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [dragOver, setDragOver] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState({ title: '', description: '', content: '', material_type: 'note' })
  const [creating, setCreating] = useState(false)
  const [uploadFile, setUploadFile] = useState(null)
  
  // Pagination
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [hasNext, setHasNext] = useState(false)
  const [hasPrev, setHasPrev] = useState(false)

  useEffect(() => {
    loadMaterials(page)
  }, [page])

  const loadMaterials = async (pageNumber = 1) => {
    try {
      setLoading(true)
      const data = await fetchMaterials({ page: pageNumber })
      
      if (data.results) {
        setMaterials(data.results)
        setHasNext(!!data.next)
        setHasPrev(!!data.previous)
        setTotalPages(Math.ceil(data.count / 50)) // 50 is DRF PAGE_SIZE
      } else {
        setMaterials(data)
        setHasNext(false)
        setHasPrev(false)
        setTotalPages(1)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setCreating(true)
    try {
      let data
      if (uploadFile) {
        data = new FormData()
        data.append('title', createForm.title)
        data.append('description', createForm.description)
        data.append('content', createForm.content)
        data.append('material_type', createForm.material_type)
        data.append('file', uploadFile)
      } else {
        data = createForm
      }
      await createMaterial(data)
      setShowCreateModal(false)
      setCreateForm({ title: '', description: '', content: '', material_type: 'note' })
      setUploadFile(null)
      loadMaterials()
    } catch (err) {
      showToast('Failed to create: ' + err.message, 'error')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this material?')) return
    try {
      await deleteMaterial(id)
      setMaterials(prev => prev.filter(m => m.id !== id))
    } catch (err) {
      showToast('Failed to delete: ' + err.message, 'error')
    }
  }

  const filtered = materials.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' || m.material_type === filterType
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
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
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
          {['all', 'pdf', 'note', 'link'].map(type => (
            <button
              key={type}
              className={`materials__filter-btn ${filterType === type ? 'active' : ''}`}
              onClick={() => setFilterType(type)}
            >
              {type === 'all' ? 'All' : `${typeIcons[type]} ${type.charAt(0).toUpperCase() + type.slice(1)}`}
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
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          const files = e.dataTransfer.files
          if (files.length > 0) {
            setUploadFile(files[0])
            setCreateForm(prev => ({ ...prev, title: files[0].name.replace(/\.[^.]+$/, ''), material_type: 'pdf' }))
            setShowCreateModal(true)
          }
        }}
      >
        <div className="materials__upload-icon">📤</div>
        <p className="materials__upload-title">Drop files here to upload</p>
        <p className="materials__upload-hint">or click to browse · PDF, TXT, MD supported</p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className={`materials__grid ${viewMode === 'list' ? 'materials__grid--list' : ''}`}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="materials__card glass-card skeleton-card">
              <div className="skeleton skeleton-title" style={{ width: '40%' }}></div>
              <div className="skeleton skeleton-text"></div>
              <div className="skeleton skeleton-text" style={{ width: '80%' }}></div>
              <div className="skeleton skeleton-text" style={{ width: '60%', marginTop: '1rem' }}></div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="materials__empty animate-fade-in">
          <span className="materials__empty-icon">⚠️</span>
          <h3>Failed to load materials</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={loadMaterials} style={{ marginTop: '1rem' }}>Retry</button>
        </div>
      )}

      {/* Materials Grid/List */}
      {!loading && !error && (
        <div className={`materials__grid ${viewMode === 'list' ? 'materials__grid--list' : ''}`}>
          {filtered.map((material, index) => (
            <div
              key={material.id}
              className={`materials__card glass-card-interactive animate-fade-in-up stagger-${Math.min(index + 3, 8)}`}
            >
              <div className="materials__card-header">
                <span className="materials__card-icon">{typeIcons[material.material_type] || '📄'}</span>
                <span className={`badge ${typeBadgeClass[material.material_type] || 'badge-primary'}`}>
                  {material.material_type?.toUpperCase()}
                </span>
              </div>
              <h3 className="materials__card-title">{material.title}</h3>
              <p className="materials__card-preview">{material.description || material.content?.substring(0, 120) || 'No description'}</p>
              <div className="materials__card-footer">
                <span className="materials__card-date">{new Date(material.created_at).toLocaleDateString()}</span>
                <span className="materials__card-size">{material.flashcard_count || 0} cards</span>
              </div>
              <div className="materials__card-actions">
                <button className="btn-icon" title="View">👁</button>
                <button className="btn-icon" title="Chat about">💬</button>
                <button className="btn-icon" title="Delete" onClick={() => handleDelete(material.id)}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="materials__empty animate-fade-in">
          <span className="materials__empty-icon">📭</span>
          <h3>{materials.length === 0 ? 'No materials yet' : 'No materials found'}</h3>
          <p>{materials.length === 0 ? 'Upload your first study material to get started!' : 'Try adjusting your search or filters'}</p>
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && !error && totalPages > 1 && (
        <div className="materials__pagination" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
          <button 
            className="btn btn-secondary" 
            disabled={!hasPrev} 
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            Previous
          </button>
          <span style={{ alignSelf: 'center', color: 'var(--text-secondary)' }}>
            Page {page} of {totalPages}
          </span>
          <button 
            className="btn btn-secondary" 
            disabled={!hasNext} 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          >
            Next
          </button>
        </div>
      )}

      {/* Create Material Modal */}
      {showCreateModal && (
        <div onClick={() => setShowCreateModal(false)} style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="glass-card-strong" onClick={e => e.stopPropagation()} style={{
            width: '100%', maxWidth: '500px', padding: '2rem',
            borderRadius: 'var(--radius-xl)', margin: '1rem'
          }}>
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Add Study Material</h2>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input className="input-glass" placeholder="Title" value={createForm.title} onChange={e => setCreateForm(prev => ({...prev, title: e.target.value}))} required style={{ width: '100%' }} />
              <textarea className="input-glass" placeholder="Description" value={createForm.description} onChange={e => setCreateForm(prev => ({...prev, description: e.target.value}))} rows={2} style={{ width: '100%', resize: 'vertical' }} />
              <textarea className="input-glass" placeholder="Content / Notes" value={createForm.content} onChange={e => setCreateForm(prev => ({...prev, content: e.target.value}))} rows={4} style={{ width: '100%', resize: 'vertical' }} />
              <select className="input-glass" value={createForm.material_type} onChange={e => setCreateForm(prev => ({...prev, material_type: e.target.value}))} style={{ width: '100%' }}>
                <option value="note">📝 Note</option>
                <option value="pdf">📄 PDF</option>
                <option value="link">🔗 Link</option>
              </select>
              <input type="file" accept=".pdf,.txt,.md" onChange={e => setUploadFile(e.target.files[0])} style={{ color: 'var(--text-secondary)' }} />
              {uploadFile && <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>📎 {uploadFile.name}</p>}
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => { setShowCreateModal(false); setUploadFile(null) }}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={creating}>{creating ? 'Creating...' : 'Create Material'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
