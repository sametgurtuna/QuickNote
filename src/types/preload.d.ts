export type Note = {
  id: string
  text: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export type QuickNoteApi = {
  on: (channel: string, listener: (...args: any[]) => void) => void
  off: (channel: string, listener: (...args: any[]) => void) => void
  invoke: (channel: string, ...args: any[]) => Promise<any>
  getAllNotes: () => Promise<Note[]>
  createNote: (text: string) => Promise<Note>
  updateNote: (id: string, text: string) => Promise<Note | null>
  deleteNote: (id: string) => Promise<boolean>
  hideWindow: () => Promise<void>
  openHistory: () => Promise<void>
  openNewNote: () => Promise<void>
}

declare global {
  interface Window {
    QuickNote: QuickNoteApi
  }
}

export {}


