import './App.css'
import { useMemo } from 'react'
import NoteWindow from './components/NoteWindow'
import HistoryWindow from './components/HistoryWindow'

function App() {
  const which = useMemo(() => new URLSearchParams(location.search).get('window') ?? 'note', [])
  if (which === 'history') return <HistoryWindow />
  return <NoteWindow />
}

export default App
