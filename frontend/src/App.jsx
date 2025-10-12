import { useEffect, useState } from 'react'
import { api } from './lib/api'

export default function App() {
  const [tab, setTab] = useState('home')

  return (
    <div style={{fontFamily:'system-ui', maxWidth:900, margin:'24px auto', padding:'0 16px'}}>
      <header style={{display:'flex', gap:12, alignItems:'center', marginBottom:16}}>
        <h1 style={{margin:'0 8px 0 0'}}>MFAH</h1>
        <nav style={{display:'flex', gap:12}}>
          <button onClick={()=>setTab('home')}>Home</button>
          <button onClick={()=>setTab('artists')}>Artists</button>
          <button onClick={()=>setTab('artworks')}>Artworks</button>
        </nav>
      </header>

      {tab === 'home' && <Home />}
      {tab === 'artists' && <Artists />}
      {tab === 'artworks' && <Artworks />}
    </div>
  )
}

function Home() {
  const [health, setHealth] = useState(null)
  useEffect(() => { api('/health').then(setHealth).catch(console.error) }, [])
  return <p>Backend health: {health?.ok ? 'OK' : '…'}</p>
}

function Artists() {
  const [items, setItems] = useState([])
  const [q, setQ] = useState('')
  const [name, setName] = useState('')

  async function load() {
    const data = await api(`/artists${q ? `?q=${encodeURIComponent(q)}` : ''}`)
    setItems(data)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q])
  

  async function create(e) {
    e.preventDefault()
    if (!name.trim()) return
    await api('/artists', { method: 'POST', body: JSON.stringify({ name }) })
    setName('')
    load()
  }

  return (
    <div>
      <h2>Artists</h2>
      <div style={{display:'flex', gap:8, margin:'12px 0'}}>
        <input placeholder="Search…" value={q} onChange={e=>setQ(e.target.value)} />
        <form onSubmit={create} style={{display:'flex', gap:8}}>
          <input placeholder="New artist name" value={name} onChange={e=>setName(e.target.value)} />
          <button>Add</button>
        </form>
      </div>
      <ul>{items.map(a => <li key={a.id}>{a.name}</li>)}</ul>
    </div>
  )
}

function Artworks() {
  const [items, setItems] = useState([])

  useEffect(() => { api('/artworks').then(setItems).catch(console.error) }, [])

  return (
    <div>
      <h2>Artworks</h2>
      <table border="1" cellPadding="8" style={{borderCollapse:'collapse'}}>
        <thead>
          <tr>
            <th>Title</th>
            <th>Year</th>
            <th>Artist</th>
          </tr>
        </thead>
        <tbody>
          {items.map(a => (
            <tr key={a.id}>
              <td>{a.title}</td>
              <td>{a.year ?? '-'}</td>
              <td>{a.artistName ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
