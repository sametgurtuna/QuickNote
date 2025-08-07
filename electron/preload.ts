import { ipcRenderer, contextBridge } from 'electron'

type Note = {
  id: string
  text: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

const api = {
  on: (channel: string, listener: (...args: any[]) => void) => {
    const wrappedListener = (_event: any, ...args: any[]) => listener(...args)
    ipcRenderer.on(channel, wrappedListener)
  },
  off: (channel: string, listener: any) => {
    ipcRenderer.off(channel, listener)
  },
  invoke: (...args: Parameters<typeof ipcRenderer.invoke>) => {
    const [channel, ...rest] = args
    return ipcRenderer.invoke(channel, ...rest)
  },
  // Notes
  getAllNotes: (): Promise<Note[]> => ipcRenderer.invoke('notes:getAll'),
  createNote: (text: string): Promise<Note> => ipcRenderer.invoke('notes:create', text),
  updateNote: (id: string, text: string): Promise<Note | null> => ipcRenderer.invoke('notes:update', id, text),
  deleteNote: (id: string): Promise<boolean> => ipcRenderer.invoke('notes:delete', id),
  // App
  hideWindow: () => ipcRenderer.invoke('app:hideWindow'),
  openHistory: () => ipcRenderer.invoke('app:openHistory'),
  openNewNote: () => ipcRenderer.invoke('app:openNewNote'),
}

contextBridge.exposeInMainWorld('QuickNote', api)
