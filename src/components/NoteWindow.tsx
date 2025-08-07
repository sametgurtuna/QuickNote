import { useEffect, useRef, useState } from 'react'

export default function NoteWindow() {
  const [text, setText] = useState('')
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const textRef = useRef<HTMLTextAreaElement | null>(null)

  // Animasyon için visibility kontrolü
  useEffect(() => {
    setIsVisible(true)
    textRef.current?.focus()
  }, [])

  // ESC ile kapat, Ctrl+Enter ile kaydet ve kapat, Ctrl+H ile geçmiş
  useEffect(() => {
    const onKey = async (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsVisible(false)
        setTimeout(() => window.QuickNote.hideWindow(), 200)
      }
      if (e.key.toLowerCase() === 'h' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        await window.QuickNote.openHistory()
      }
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        await saveNote()
        resetComposer() // Sadece manuel kaydet-kapat'ta formu temizle
        setIsVisible(false)
        setTimeout(async () => {
          await window.QuickNote.hideWindow()
        }, 200)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [text, currentNoteId])

  // Pencere gösterildiğinde düzenleyiciyi sıfırla ve odakla
  useEffect(() => {
    const handler = () => {
      resetComposer()
      setIsVisible(true)
      setTimeout(() => textRef.current?.focus(), 100)
    }
    window.QuickNote.on('note:show', handler)
    return () => window.QuickNote.off('note:show', handler as any)
  }, [])

  // Hızlı auto-save - direkt geçmişe kaydet
  useEffect(() => {
    if (!text.trim()) return
    setSaving(true)
    const t = setTimeout(async () => {
      await saveNote()
    }, 1000)
    return () => clearTimeout(t)
  }, [text])

  async function saveNote() {
    if (!text.trim()) return
    console.log('💾 Saving note:', text.substring(0, 50) + '...')
    try {
      // Her zaman yeni not oluştur ve direkt geçmişe kaydet
      const note = await window.QuickNote.createNote(text.trim())
      console.log('✅ Note saved successfully:', note.id)
      setLastSaved(note.updatedAt)
      setSaving(false)
      
      // Form temizleme - sadece manuel kaydetmede
      return note
    } catch (error) {
      console.error('❌ Save error:', error)
      setSaving(false)
    }
  }

  function resetComposer() {
    setText('')
    setCurrentNoteId(null)
    setLastSaved(null)
    setSaving(false)
  }

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length
  const charCount = text.length

  return (
    <div style={{...containerStyle, opacity: isVisible ? 1 : 0, transform: isVisible ? 'scale(1)' : 'scale(0.95)'}}>
      {/* Title Bar */}
      <div style={titleBarStyle}>
        <div style={titleStyle}>
          <span style={titleIconStyle}>✨</span>
          Quick Note
        </div>
        <div style={statusStyle}>
          {saving && <StatusIndicator type="saving" />}
          {!saving && lastSaved && <StatusIndicator type="saved" />}
        </div>
      </div>

      {/* Main Content */}
      <div style={contentStyle}>
        <div style={textareaContainerStyle}>
          <textarea
            ref={textRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Hızlı notunuzu yazın..."
            style={textareaStyle}
          />
          <div style={placeholderHintStyle}>
            💡 <strong>İpuçları:</strong> Ctrl+Enter kaydet & kapat • Ctrl+H geçmiş • #etiket
          </div>
        </div>
        
        {/* Stats */}
        <div style={statsStyle}>
          <span>{wordCount} kelime</span>
          <span>•</span>
          <span>{charCount} karakter</span>
        </div>
      </div>

      {/* Actions */}
      <div style={actionsStyle}>
        <button 
          onClick={() => window.QuickNote.openHistory()} 
          style={secondaryBtn}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'var(--qn-card-bg)'}
        >
          📚 Geçmiş
        </button>
        <button 
          onClick={async () => {
            await saveNote()
            resetComposer() // Manuel kaydet butonunda formu temizle
          }} 
          style={primaryBtn}
          disabled={!text.trim() || saving}
          onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.background = 'var(--qn-accent-hover)')}
          onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.background = 'var(--qn-accent)')}
        >
          {saving ? '⏳ Kaydediliyor...' : '💾 Kaydet'}
        </button>
      </div>
    </div>
  )
}

function StatusIndicator({ type }: { type: 'saving' | 'saved' }) {
  if (type === 'saving') {
    return (
      <div style={statusIndicatorStyle}>
        <div style={spinnerStyle}>⏳</div>
        <span>Kaydediliyor...</span>
      </div>
    )
  }
  
  return (
    <div style={{...statusIndicatorStyle, color: 'var(--qn-success)'}}>
      <span>✅</span>
      <span>Kaydedildi</span>
    </div>
  )
}

const containerStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  background: 'var(--qn-bg-solid)',
  backdropFilter: 'blur(20px)',
  borderRadius: 'var(--qn-radius-lg)',
  border: '1px solid var(--qn-card-border)',
  boxShadow: 'var(--qn-shadow-xl)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  overflow: 'hidden',
}

const titleBarStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '16px 20px 12px',
  borderBottom: '1px solid var(--qn-card-border)',
  background: 'rgba(255, 255, 255, 0.02)',
}

const titleStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  fontSize: 16,
  fontWeight: 600,
  color: 'var(--qn-fg)',
}

const titleIconStyle: React.CSSProperties = {
  fontSize: 18,
  filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))',
}

const statusStyle: React.CSSProperties = {
  fontSize: 12,
  opacity: 0.8,
}

const statusIndicatorStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  fontSize: 12,
  color: 'var(--qn-fg-muted)',
}

const spinnerStyle: React.CSSProperties = {
  animation: 'spin 1s linear infinite',
}

const contentStyle: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  padding: '20px',
  gap: 12,
}

const textareaContainerStyle: React.CSSProperties = {
  flex: 1,
  position: 'relative',
}

const textareaStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  resize: 'none',
  background: 'var(--qn-card-bg)',
  border: '1px solid var(--qn-card-border)',
  borderRadius: 'var(--qn-radius-md)',
  color: 'var(--qn-fg)',
  padding: '16px',
  fontSize: 14,
  lineHeight: 1.6,
  fontFamily: 'inherit',
  transition: 'all 0.2s ease',
}

const placeholderHintStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: 8,
  left: 12,
  right: 12,
  fontSize: 11,
  color: 'var(--qn-fg-muted)',
  background: 'rgba(15, 15, 35, 0.9)',
  padding: '6px 8px',
  borderRadius: 'var(--qn-radius-sm)',
  border: '1px solid var(--qn-card-border)',
  backdropFilter: 'blur(10px)',
}

const statsStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  fontSize: 11,
  color: 'var(--qn-fg-muted)',
  padding: '8px 0',
}

const actionsStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '16px 20px 20px',
  borderTop: '1px solid var(--qn-card-border)',
  background: 'rgba(255, 255, 255, 0.02)',
}

const secondaryBtn: React.CSSProperties = {
  background: 'var(--qn-card-bg)',
  border: '1px solid var(--qn-card-border)',
  color: 'var(--qn-fg)',
  borderRadius: 'var(--qn-radius-md)',
  padding: '10px 16px',
  fontSize: 13,
  fontWeight: 500,
  transition: 'all 0.2s ease',
  backdropFilter: 'blur(10px)',
}

const primaryBtn: React.CSSProperties = {
  background: 'var(--qn-accent)',
  border: '1px solid var(--qn-accent)',
  color: 'white',
  borderRadius: 'var(--qn-radius-md)',
  padding: '10px 16px',
  fontSize: 13,
  fontWeight: 500,
  transition: 'all 0.2s ease',
  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
  flex: 1,
  maxWidth: 120,
  marginLeft: 'auto',
}


