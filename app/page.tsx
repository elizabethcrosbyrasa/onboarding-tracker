'use client'
import { useState, useEffect } from 'react'

const CATEGORIES = [
  'Template Building & Edits',
  'Content Sourcing & Filtering',
  'Client Meetings',
  'Email Support - Q&A / Tickets / Troubleshooting',
  'Other',
]
const PEOPLE = ['Ali', 'Elizabeth']

type Entry = {
  id: string
  person: string
  category: string
  hours: number
  notes: string
  date: string
}

export default function Home() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [form, setForm] = useState({
    person: 'Ali',
    category: CATEGORIES[0],
    hours: '',
    notes: '',
    date: new Date().toISOString().split('T')[0],
  })
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState<'log' | 'dashboard'>('log')
  const [msg, setMsg] = useState('')

  useEffect(() => { fetchEntries() }, [])

  async function fetchEntries() {
    try {
      const res = await fetch('/api/entries')
      const data = await res.json()
      setEntries(data.entries || [])
    } catch (e) {
      console.error(e)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.hours || Number(form.hours) <= 0) return alert('Please enter valid hours')
    setLoading(true)
    setMsg('')
    try {
      await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, hours: Number(form.hours), id: Date.now().toString() }),
      })
      setForm(f => ({ ...f, hours: '', notes: '' }))
      await fetchEntries()
      setMsg('Time logged!')
      setView('dashboard')
    } catch (e) {
      setMsg('Error saving. Please try again.')
    }
    setLoading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this entry?')) return
    await fetch('/api/entries?id=' + id, { method: 'DELETE' })
    await fetchEntries()
  }

  const totalByPerson = PEOPLE.map(p => ({
    person: p,
    hours: entries.filter(e => e.person === p).reduce((s, e) => s + e.hours, 0)
  }))
  const totalByCategory = CATEGORIES.map(c => ({
    category: c,
    hours: entries.filter(e => e.category === c).reduce((s, e) => s + e.hours, 0)
  }))
  const grandTotal = entries.reduce((s, e) => s + e.hours, 0)

  const inp: React.CSSProperties = {
    width: '100%', padding: '10px 12px', borderRadius: 8,
    border: '1px solid #1e2a3a', background: '#0a0f1e', color: '#fff',
    fontSize: 14, boxSizing: 'border-box',
  }

  return (
    <div style={{ maxWidth: 920, margin: '0 auto', padding: '32px 16px' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#fff', margin: 0 }}>
          ⏱ Onboarding Time Tracker
        </h1>
        <p style={{ color: '#8892a4', marginTop: 6, fontSize: 14 }}>
          Track client onboarding hours — Ali & Elizabeth
        </p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {(['log', 'dashboard'] as const).map(v => (
          <button key={v} onClick={() => setView(v)} style={{
            padding: '9px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
            fontWeight: 600, fontSize: 14,
            background: view === v ? '#3b82f6' : '#131c2e',
            color: view === v ? '#fff' : '#8892a4',
          }}>
            {v === 'log' ? '+ Log Time' : `Dashboard (${entries.length})`}
          </button>
        ))}
      </div>

      {view === 'log' && (
        <div style={{ background: '#131c2e', borderRadius: 12, padding: 24, border: '1px solid #1e2a3a' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: '#8892a4', fontWeight: 600 }}>Person</label>
                <select style={inp} value={form.person} onChange={e => setForm(f => ({ ...f, person: e.target.value }))}>
                  {PEOPLE.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: '#8892a4', fontWeight: 600 }}>Date</label>
                <input type="date" style={inp} value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: '#8892a4', fontWeight: 600 }}>Category</label>
              <select style={inp} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16, marginBottom: 20 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: '#8892a4', fontWeight: 600 }}>Hours</label>
                <input type="number" step="0.25" min="0.25" style={inp} placeholder="e.g. 1.5"
                  value={form.hours} onChange={e => setForm(f => ({ ...f, hours: e.target.value }))} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: '#8892a4', fontWeight: 600 }}>Notes (optional)</label>
                <input type="text" style={inp} placeholder="What did you work on?"
                  value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>
            {msg && <p style={{ color: msg.includes('Error') ? '#ef4444' : '#22c55e', marginBottom: 12, fontSize: 14 }}>{msg}</p>}
            <button type="submit" disabled={loading} style={{
              background: loading ? '#1e2a3a' : '#3b82f6', color: '#fff', border: 'none',
              padding: '12px 28px', borderRadius: 8, fontWeight: 700, fontSize: 15,
              cursor: loading ? 'not-allowed' : 'pointer', width: '100%',
            }}>
              {loading ? 'Saving...' : 'Log Time'}
            </button>
          </form>
        </div>
      )}

      {view === 'dashboard' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 20 }}>
            <div style={{ background: '#131c2e', borderRadius: 10, padding: '16px 20px', border: '1px solid #1e2a3a' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#3b82f6' }}>{grandTotal.toFixed(1)}h</div>
              <div style={{ fontSize: 12, color: '#8892a4', marginTop: 2 }}>Total Hours</div>
            </div>
            {totalByPerson.map(p => (
              <div key={p.person} style={{ background: '#131c2e', borderRadius: 10, padding: '16px 20px', border: '1px solid #1e2a3a' }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#3b82f6' }}>{p.hours.toFixed(1)}h</div>
                <div style={{ fontSize: 12, color: '#8892a4', marginTop: 2 }}>{p.person}</div>
              </div>
            ))}
          </div>

          <div style={{ background: '#131c2e', borderRadius: 12, padding: 24, border: '1px solid #1e2a3a', marginBottom: 20 }}>
            <h3 style={{ margin: '0 0 16px', color: '#fff', fontSize: 15 }}>Hours by Category</h3>
            {totalByCategory.filter(c => c.hours > 0).length === 0
              ? <p style={{ color: '#8892a4', margin: 0, fontSize: 14 }}>No entries yet.</p>
              : totalByCategory.filter(c => c.hours > 0).map(c => (
                <div key={c.category} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid #1a2235', fontSize: 14 }}>
                  <span style={{ color: '#cbd5e1' }}>{c.category}</span>
                  <span style={{ color: '#3b82f6', fontWeight: 700 }}>{c.hours.toFixed(1)}h</span>
                </div>
              ))
            }
          </div>

          <div style={{ background: '#131c2e', borderRadius: 12, padding: 24, border: '1px solid #1e2a3a' }}>
            <h3 style={{ margin: '0 0 16px', color: '#fff', fontSize: 15 }}>All Entries</h3>
            {entries.length === 0
              ? <p style={{ color: '#8892a4', margin: 0, fontSize: 14 }}>No entries yet. Log some time!</p>
              : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        {['Date', 'Person', 'Category', 'Hours', 'Notes', ''].map(h => (
                          <th key={h} style={{ textAlign: 'left', padding: '10px 12px', color: '#8892a4', fontSize: 12, fontWeight: 600, borderBottom: '1px solid #1e2a3a' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[...entries].sort((a, b) => b.date.localeCompare(a.date)).map(e => (
                        <tr key={e.id}>
                          <td style={{ padding: '11px 12px', borderBottom: '1px solid #1a2235', fontSize: 14, whiteSpace: 'nowrap' }}>{e.date}</td>
                          <td style={{ padding: '11px 12px', borderBottom: '1px solid #1a2235', fontSize: 14 }}>{e.person}</td>
                          <td style={{ padding: '11px 12px', borderBottom: '1px solid #1a2235', fontSize: 13, maxWidth: 220 }}>{e.category}</td>
                          <td style={{ padding: '11px 12px', borderBottom: '1px solid #1a2235', fontSize: 14, color: '#3b82f6', fontWeight: 700 }}>{e.hours}h</td>
                          <td style={{ padding: '11px 12px', borderBottom: '1px solid #1a2235', fontSize: 13, color: '#8892a4' }}>{e.notes || '—'}</td>
                          <td style={{ padding: '11px 12px', borderBottom: '1px solid #1a2235' }}>
                            <button onClick={() => handleDelete(e.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 700, fontSize: 16, padding: 0 }}>✕</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            }
          </div>
        </>
      )}
    </div>
  )
}
