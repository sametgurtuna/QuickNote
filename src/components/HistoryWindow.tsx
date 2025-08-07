import { useEffect, useState } from 'react'

type Note = {
  id: string
  text: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export default function HistoryWindow() {
  const [notes, setNotes] = useState<Note[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [isVisible, setIsVisible] = useState(false)

  async function load() {
    console.log('📚 Loading notes...')
    const all = await window.QuickNote.getAllNotes()
    console.log('📚 Loaded notes:', all.length)
    setNotes(all)
  }

  useEffect(() => {
    setIsVisible(true)
    load()
    
    // Not değişikliklerini dinle
    const refreshHandler = () => {
      console.log('🔄 Notes refresh event received')
      load() // Notları yeniden yükle
    }
    
    window.QuickNote.on('notes:refresh', refreshHandler)
    return () => window.QuickNote.off('notes:refresh', refreshHandler)
  }, [])

  // Klavye kısayolları
  useEffect(() => {
    const onKey = async (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        await window.QuickNote.hideWindow()
      }
      if (e.key.toLowerCase() === 'n' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        await window.QuickNote.hideWindow()
        await window.QuickNote.openNewNote()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  async function onDelete(id: string) {
    if (!confirm('Bu notu silmek istediğinizden emin misiniz?')) return
    await window.QuickNote.deleteNote(id)
    await load()
  }

  function startEdit(n: Note) {
    setEditingId(n.id)
    setDraft(n.text)
  }

  async function saveEdit(id: string) {
    if (!draft.trim()) return
    await window.QuickNote.updateNote(id, draft.trim())
    setEditingId(null)
    setDraft('')
    await load()
  }

  function cancelEdit() {
    setEditingId(null)
    setDraft('')
  }

  const filteredNotes = notes.filter(note => 
    note.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  function formatRelativeTime(dateStr: string) {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor(diffMs / (1000 * 60))

    if (diffMinutes < 1) return 'Az önce'
    if (diffMinutes < 60) return `${diffMinutes} dk önce`
    if (diffHours < 24) return `${diffHours} sa önce`
    if (diffDays < 7) return `${diffDays} gün önce`
    return date.toLocaleDateString('tr-TR')
  }

  return (
    <div style={{...container, opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(-10px)'}}>
      {/* Header */}
      <div style={header}>
        <div style={titleStyle}>
          <span style={titleIconStyle}>📚</span>
          Not Geçmişi
          <span style={countStyle}>({filteredNotes.length})</span>
        </div>
        <div style={headerActions}>
          <button 
            onClick={async () => {
              await window.QuickNote.hideWindow()
              // Direkt not penceresini aç
              await window.QuickNote.openNewNote()
            }}
            style={newNoteBtn}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--qn-accent-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--qn-accent)'}
          >
            ✨ Yeni Not
          </button>
          <button 
            onClick={() => window.QuickNote.hideWindow()} 
            style={closeBtn}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Search */}
      <div style={searchContainer}>
        <div style={searchInputContainer}>
          <span style={searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Notlarda ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={searchInput}
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')} 
              style={clearSearchBtn}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Notes List */}
      <div style={list}>
        {filteredNotes.length === 0 && !searchTerm && (
          <div style={emptyState}>
            <div style={emptyIconStyle}>📝</div>
            <div>Henüz not yok</div>
            <div style={emptyHintStyle}>Ctrl+Shift+N ile ilk notunuzu oluşturun</div>
          </div>
        )}
        
        {filteredNotes.length === 0 && searchTerm && (
          <div style={emptyState}>
            <div style={emptyIconStyle}>🔍</div>
            <div>Arama sonucu bulunamadı</div>
            <div style={emptyHintStyle}>"{searchTerm}" için sonuç yok</div>
          </div>
        )}

        {filteredNotes.map((note, index) => (
          <div 
            key={note.id} 
            style={{
              ...item,
              animationDelay: `${index * 50}ms`,
            }}
          >
            <div style={itemHeader}>
              <div style={timeStyle}>
                <span style={relativeTimeStyle}>{formatRelativeTime(note.updatedAt)}</span>
                <span style={absoluteTimeStyle}>{new Date(note.updatedAt).toLocaleString('tr-TR')}</span>
              </div>
              <div style={actionsContainer}>
                {editingId === note.id ? (
                  <>
                    <button 
                      style={saveBtn} 
                      onClick={() => saveEdit(note.id)}
                      disabled={!draft.trim()}
                    >
                      ✅ Kaydet
                    </button>
                    <button style={cancelBtn} onClick={cancelEdit}>
                      ❌ Vazgeç
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      style={editBtn} 
                      onClick={() => startEdit(note)}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      ✏️
                    </button>
                    <button 
                      style={deleteBtn} 
                      onClick={() => onDelete(note.id)}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      🗑️
                    </button>
                  </>
                )}
              </div>
            </div>

            {editingId === note.id ? (
              <textarea 
                value={draft} 
                onChange={e => setDraft(e.target.value)} 
                style={editArea} 
                rows={4}
                autoFocus
              />
            ) : (
              <div style={noteContentStyle}>{note.text}</div>
            )}

            {note.tags.length > 0 && (
              <div style={tagRow}>
                {note.tags.map(tag => (
                  <span 
                    key={tag} 
                    style={tag.toLowerCase().includes(searchTerm.toLowerCase()) ? highlightedTag : tagStyle}
                    onClick={() => setSearchTerm(tag)}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

const container: React.CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  background: 'var(--qn-bg-solid)',
  backdropFilter: 'blur(20px)',
  borderRadius: 'var(--qn-radius-lg)',
  border: '1px solid var(--qn-card-border)',
  boxShadow: 'var(--qn-shadow-xl)',
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
}

const header: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '16px 20px',
  borderBottom: '1px solid var(--qn-card-border)',
  background: 'rgba(255, 255, 255, 0.02)',
}

const titleStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  fontSize: 18,
  fontWeight: 600,
  color: 'var(--qn-fg)',
}

const titleIconStyle: React.CSSProperties = {
  fontSize: 20,
  filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))',
}

const countStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 400,
  color: 'var(--qn-fg-muted)',
  background: 'var(--qn-card-bg)',
  padding: '2px 8px',
  borderRadius: 'var(--qn-radius-sm)',
  border: '1px solid var(--qn-card-border)',
}

const headerActions: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
}

const newNoteBtn: React.CSSProperties = {
  background: 'var(--qn-accent)',
  border: '1px solid var(--qn-accent)',
  color: 'white',
  fontSize: 13,
  padding: '8px 12px',
  borderRadius: 'var(--qn-radius-md)',
  fontWeight: 500,
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
}

const closeBtn: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  color: 'var(--qn-fg-muted)',
  fontSize: 16,
  width: 32,
  height: 32,
  borderRadius: 'var(--qn-radius-sm)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s ease',
  cursor: 'pointer',
}

const searchContainer: React.CSSProperties = {
  padding: '0 20px 16px',
  borderBottom: '1px solid var(--qn-card-border)',
  background: 'rgba(255, 255, 255, 0.02)',
}

const searchInputContainer: React.CSSProperties = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
}

const searchIcon: React.CSSProperties = {
  position: 'absolute',
  left: 12,
  fontSize: 14,
  color: 'var(--qn-fg-muted)',
  zIndex: 1,
}

const searchInput: React.CSSProperties = {
  width: '100%',
  padding: '10px 40px 10px 36px',
  background: 'var(--qn-card-bg)',
  border: '1px solid var(--qn-card-border)',
  borderRadius: 'var(--qn-radius-md)',
  color: 'var(--qn-fg)',
  fontSize: 14,
  transition: 'all 0.2s ease',
}

const clearSearchBtn: React.CSSProperties = {
  position: 'absolute',
  right: 8,
  background: 'transparent',
  border: 'none',
  color: 'var(--qn-fg-muted)',
  fontSize: 12,
  width: 20,
  height: 20,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
}

const list: React.CSSProperties = {
  flex: 1,
  overflow: 'auto',
  padding: '16px 20px 20px',
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
}

const emptyState: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  padding: '40px 20px',
  color: 'var(--qn-fg-muted)',
  minHeight: 200,
}

const emptyIconStyle: React.CSSProperties = {
  fontSize: 48,
  marginBottom: 16,
  opacity: 0.5,
}

const emptyHintStyle: React.CSSProperties = {
  fontSize: 12,
  marginTop: 8,
  opacity: 0.7,
}

const item: React.CSSProperties = {
  background: 'var(--qn-card-bg)',
  border: '1px solid var(--qn-card-border)',
  borderRadius: 'var(--qn-radius-md)',
  padding: '16px',
  transition: 'all 0.2s ease',
  backdropFilter: 'blur(10px)',
  animation: 'slideInUp 0.3s ease forwards',
}

const itemHeader: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  marginBottom: 12,
  gap: 12,
}

const timeStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
}

const relativeTimeStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 500,
  color: 'var(--qn-accent)',
}

const absoluteTimeStyle: React.CSSProperties = {
  fontSize: 10,
  color: 'var(--qn-fg-muted)',
  opacity: 0.8,
}

const actionsContainer: React.CSSProperties = {
  display: 'flex',
  gap: 6,
}

const editBtn: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  color: 'var(--qn-fg-muted)',
  fontSize: 16,
  width: 32,
  height: 32,
  borderRadius: 'var(--qn-radius-sm)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s ease',
  cursor: 'pointer',
}

const deleteBtn: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  color: 'var(--qn-fg-muted)',
  fontSize: 16,
  width: 32,
  height: 32,
  borderRadius: 'var(--qn-radius-sm)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s ease',
  cursor: 'pointer',
}

const saveBtn: React.CSSProperties = {
  background: 'var(--qn-success)',
  border: 'none',
  color: 'white',
  fontSize: 12,
  padding: '6px 12px',
  borderRadius: 'var(--qn-radius-sm)',
  fontWeight: 500,
  transition: 'all 0.2s ease',
  cursor: 'pointer',
}

const cancelBtn: React.CSSProperties = {
  background: 'var(--qn-danger)',
  border: 'none',
  color: 'white',
  fontSize: 12,
  padding: '6px 12px',
  borderRadius: 'var(--qn-radius-sm)',
  fontWeight: 500,
  transition: 'all 0.2s ease',
  cursor: 'pointer',
}

const noteContentStyle: React.CSSProperties = {
  whiteSpace: 'pre-wrap',
  lineHeight: 1.6,
  color: 'var(--qn-fg)',
  fontSize: 14,
  marginBottom: 12,
}

const editArea: React.CSSProperties = {
  width: '100%',
  minHeight: 80,
  resize: 'vertical',
  background: 'rgba(0, 0, 0, 0.3)',
  border: '1px solid var(--qn-card-border)',
  borderRadius: 'var(--qn-radius-sm)',
  color: 'var(--qn-fg)',
  padding: '12px',
  fontSize: 14,
  lineHeight: 1.6,
  fontFamily: 'inherit',
  marginBottom: 12,
  transition: 'all 0.2s ease',
}

const tagRow: React.CSSProperties = {
  display: 'flex',
  gap: 6,
  flexWrap: 'wrap',
  marginTop: 8,
}

const tagStyle: React.CSSProperties = {
  fontSize: 11,
  background: 'rgba(59, 130, 246, 0.1)',
  color: 'var(--qn-accent)',
  padding: '3px 8px',
  borderRadius: 'var(--qn-radius-sm)',
  border: '1px solid rgba(59, 130, 246, 0.2)',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
}

const highlightedTag: React.CSSProperties = {
  ...tagStyle,
  background: 'var(--qn-accent)',
  color: 'white',
  border: '1px solid var(--qn-accent)',
  boxShadow: '0 0 8px rgba(59, 130, 246, 0.4)',
}


