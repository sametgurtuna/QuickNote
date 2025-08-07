import { app, BrowserWindow, globalShortcut, ipcMain, screen, autoUpdater, Tray, Menu, nativeImage } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs/promises'
import { randomUUID } from 'node:crypto'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, '..')
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

type Note = {
  id: string
  text: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

let noteWindow: BrowserWindow | null = null
let historyWindow: BrowserWindow | null = null
let tray: Tray | null = null

const getNotesFilePath = () => path.join(app.getPath('userData'), 'notes.json')

async function ensureNotesFile() {
  const filePath = getNotesFilePath()
  try {
    await fs.access(filePath)
  } catch {
    await fs.mkdir(path.dirname(filePath), { recursive: true })
    await fs.writeFile(filePath, '[]', 'utf-8')
  }
}

async function readNotes(): Promise<Note[]> {
  await ensureNotesFile()
  const raw = await fs.readFile(getNotesFilePath(), 'utf-8')
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    
    // Eski notları migration yap - eksik tarihleri ekle
    const migratedNotes = parsed.map((note: any) => {
      const now = new Date().toISOString()
      return {
        id: note.id || randomUUID(),
        text: note.text || '',
        tags: Array.isArray(note.tags) ? note.tags : [],
        createdAt: note.createdAt || now,
        updatedAt: note.updatedAt || note.createdAt || now
      } as Note
    })
    
    return migratedNotes
  } catch {
    return []
  }
}

async function writeNotes(notes: Note[]) {
  console.log('💾 Writing notes to file:', notes.length, 'notes')
  console.log('📁 File path:', getNotesFilePath())
  try {
    await fs.writeFile(getNotesFilePath(), JSON.stringify(notes, null, 2), 'utf-8')
    console.log('✅ Notes written successfully')
  } catch (error) {
    console.error('❌ Failed to write notes:', error)
    throw error
  }
}

function parseTags(text: string): string[] {
  const set = new Set<string>()
  const regex = /(^|\s)#([\p{L}\p{N}_-]+)/gu
  let match: RegExpExecArray | null
  while ((match = regex.exec(text))) {
    set.add(match[2].toLowerCase())
  }
  return Array.from(set)
}

function centerChildBounds(width: number, height: number) {
  const primary = screen.getPrimaryDisplay().workArea
  const x = Math.floor(primary.x + (primary.width - width) / 2)
  const y = Math.floor(primary.y + (primary.height - height) / 3)
  return { x, y }
}

function createNoteWindow() {
  if (noteWindow) return noteWindow
  const width = 520
  const height = 320
  const { x, y } = centerChildBounds(width, height)
  noteWindow = new BrowserWindow({
    width,
    height,
    x,
    y,
    frame: false,
    transparent: false,
    resizable: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    show: false,
    vibrancy: process.platform === 'win32' ? undefined : 'under-window',

    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  const urlDev = `${VITE_DEV_SERVER_URL}?window=note`
  if (VITE_DEV_SERVER_URL) noteWindow.loadURL(urlDev)
  else noteWindow.loadFile(path.join(RENDERER_DIST, 'index.html'), { search: '?window=note' })

  noteWindow.on('blur', () => {
    // Pencere odak kaybedince otomatik gizle
    noteWindow?.hide()
  })
  noteWindow.on('closed', () => (noteWindow = null))
  return noteWindow
}

function createHistoryWindow() {
  if (historyWindow) return historyWindow
  const width = 720
  const height = 520
  const { x, y } = centerChildBounds(width, height)
  historyWindow = new BrowserWindow({
    width,
    height,
    x,
    y,
    frame: false,
    resizable: true,
    alwaysOnTop: false,
    skipTaskbar: false,
    show: false,

    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  const urlDev = `${VITE_DEV_SERVER_URL}?window=history`
  if (VITE_DEV_SERVER_URL) historyWindow.loadURL(urlDev)
  else historyWindow.loadFile(path.join(RENDERER_DIST, 'index.html'), { search: '?window=history' })

  historyWindow.on('closed', () => (historyWindow = null))
  return historyWindow
}

function toggleNoteWindow() {
  const win = createNoteWindow()
  if (win.isVisible()) win.hide()
  else {
    win.center()
    win.show()
    win.focus()
    win.webContents.send('note:show')
  }
}

function registerGlobalShortcuts() {
  globalShortcut.unregisterAll()
  globalShortcut.register('CommandOrControl+Shift+N', () => {
    toggleNoteWindow()
  })
  // Optional: Geçmiş penceresi için ikinci kısayol
  globalShortcut.register('CommandOrControl+Alt+N', () => {
    const win = createHistoryWindow()
    win.show()
    win.focus()
  })
}

function createTray() {
  // Basit text-based icon oluştur
  const iconImage = nativeImage.createFromNamedImage('NSImageNameApplicationIcon')
  if (iconImage.isEmpty()) {
    // Fallback: Basit 16x16 beyaz kare oluştur
    const canvas = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG header
      0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
      0x00, 0x00, 0x00, 0x10, 0x00, 0x00, 0x00, 0x10, // 16x16
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0xF3, 0xFF, 0x61, // RGB+Alpha
      0x00, 0x00, 0x00, 0x1F, 0x49, 0x44, 0x41, 0x54, // IDAT chunk
      0x78, 0x9C, 0x62, 0xFC, 0xFF, 0xFF, 0x3F, 0x03, // Compressed white square
      0x00, 0x08, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00,
      0x00, 0x18, 0xDD, 0x8D, 0xB4, 0x1C, 0x00, 0x00,
      0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82 // End
    ])
    tray = new Tray(nativeImage.createFromBuffer(canvas))
  } else {
    tray = new Tray(iconImage)
  }
  
  tray.setToolTip('Quick Note - Hızlı Not Alma')
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '✨ Hızlı Not (Ctrl+Shift+N)',
      click: () => toggleNoteWindow(),
    },
    {
      label: '📚 Geçmiş (Ctrl+Alt+N)',
      click: () => {
        const win = createHistoryWindow()
        win.show()
        win.focus()
      },
    },
    { type: 'separator' },
    { 
      label: 'Hakkında',
      click: () => {
        // Basit bilgi popup'ı göster
        const { dialog } = require('electron')
        dialog.showMessageBox({
          type: 'info',
          title: 'Quick Note',
          message: 'Quick Note v0.0.4',
          detail: 'Hızlı not alma uygulaması\n\nCtrl+Shift+N: Hızlı not\nCtrl+Alt+N: Geçmiş'
        })
      }
    },
    { type: 'separator' },
    { label: '🚪 Çıkış', role: 'quit' },
  ])
  
  tray.setContextMenu(contextMenu)
  tray.on('click', () => toggleNoteWindow())
  tray.on('double-click', () => {
    const win = createHistoryWindow()
    win.show()
    win.focus()
  })
}

function setupIpc() {
  ipcMain.handle('notes:getAll', async () => {
    const notes = await readNotes()
    console.log('📚 Loading notes:', notes.length, 'total')
    
    // Güvenli sıralama - undefined tarihleri kontrol et
    return notes.sort((a, b) => {
      const dateA = a.updatedAt || a.createdAt || '1970-01-01T00:00:00.000Z'
      const dateB = b.updatedAt || b.createdAt || '1970-01-01T00:00:00.000Z'
      return dateB.localeCompare(dateA)
    })
  })

  ipcMain.handle('notes:create', async (_e, text: string) => {
    console.log('📝 Creating new note with text:', text.substring(0, 50) + '...')
    const now = new Date().toISOString()
    const newNote: Note = {
      id: randomUUID(),
      text,
      tags: parseTags(text),
      createdAt: now,
      updatedAt: now,
    }
    const notes = await readNotes()
    console.log('📚 Current notes count before add:', notes.length)
    notes.unshift(newNote)
    await writeNotes(notes)
    console.log('📝 Note created successfully, ID:', newNote.id)
    
    // Tüm açık pencereler notları yenilesin
    console.log('📡 Sending notes:refresh to all windows')
    BrowserWindow.getAllWindows().forEach(window => {
      console.log('📡 Sending to window:', window.getTitle())
      window.webContents.send('notes:refresh')
    })
    
    return newNote
  })

  ipcMain.handle('notes:update', async (_e, id: string, text: string) => {
    const notes = await readNotes()
    const idx = notes.findIndex(n => n.id === id)
    if (idx === -1) return null
    const now = new Date().toISOString()
    notes[idx] = { ...notes[idx], text, tags: parseTags(text), updatedAt: now }
    await writeNotes(notes)
    
    // Tüm açık pencereler notları yenilesin
    console.log('📡 Sending notes:refresh to all windows')
    BrowserWindow.getAllWindows().forEach(window => {
      console.log('📡 Sending to window:', window.getTitle())
      window.webContents.send('notes:refresh')
    })
    
    return notes[idx]
  })

  ipcMain.handle('notes:delete', async (_e, id: string) => {
    const notes = await readNotes()
    const filtered = notes.filter(n => n.id !== id)
    await writeNotes(filtered)
    
    // Tüm açık pencereler notları yenilesin
    console.log('📡 Sending notes:refresh to all windows')
    BrowserWindow.getAllWindows().forEach(window => {
      console.log('📡 Sending to window:', window.getTitle())
      window.webContents.send('notes:refresh')
    })
    
    return true
  })

  ipcMain.handle('app:hideWindow', () => {
    noteWindow?.hide()
    historyWindow?.hide()
  })

  ipcMain.handle('app:openHistory', () => {
    const win = createHistoryWindow()
    win.show()
    win.focus()
  })

  ipcMain.handle('app:openNewNote', () => {
    toggleNoteWindow()
  })
}

app.setAppUserModelId('Quick Note')

// Auto-updater kurulumu (production'da)
if (!process.defaultApp) {
  // GitHub releases'den güncelleme kontrolü
  autoUpdater.setFeedURL({
    url: 'https://github.com/samet/quicknote/releases/latest',
    serverType: 'json'
  })
  
  // Uygulama başladığında güncelleme kontrolü
  autoUpdater.checkForUpdates()
  
  // Her 24 saatte bir güncelleme kontrolü
  setInterval(() => {
    autoUpdater.checkForUpdates()
  }, 24 * 60 * 60 * 1000)
}

// Sistem başlangıcında otomatik başlatma (production'da)
if (!process.defaultApp) {
  app.setLoginItemSettings({
    openAtLogin: true,
    openAsHidden: true,
    name: 'Quick Note',
    path: process.execPath,
    args: ['--hidden']
  })
}

app.whenReady().then(async () => {
  await ensureNotesFile()
  createTray()
  setupIpc()
  registerGlobalShortcuts()
  
  // Note penceresini hazırlı tut ama göstermeden
  createNoteWindow()
  
  // Gizli başlatma mı kontrol et
  const isHiddenStart = process.argv.includes('--hidden') || app.getLoginItemSettings().wasOpenedAsHidden
  
  if (isHiddenStart) {
    console.log('🔇 Quick Note gizli başlatıldı (sistem başlangıcı)')
  } else {
    console.log('🚀 Quick Note başlatıldı!')
  }
  
  console.log('📝 Ctrl+Shift+N: Hızlı not penceresi')
  console.log('📚 Ctrl+Alt+N: Geçmiş penceresi')
})

app.on('window-all-closed', () => {
  // Tray uygulaması, Windows'ta tüm pencereler kapansa da çalışmaya devam eder
  if (process.platform !== 'darwin') {
    // pencere referanslarını temizle
    noteWindow = null
    historyWindow = null
  }
})

app.on('activate', () => {
  if (!noteWindow) createNoteWindow()
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})
