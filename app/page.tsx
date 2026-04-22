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
    width: '100%', padding: '9px 12px', borderRadius: 8,
    border: '1px solid #e5e7eb', background: '#fff', color: '#111827',
    fontSize: 14, boxSizing: 'border-box',
  }

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 20px' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: 0 }}>
          Onboarding Time Tracker
        </h1>
        <p style={{ color: '#6b7280', marginTop: 6, fontSize: 14, margin: '6px 0 0' }}>
          Ali & Elizabeth — client onboarding hours
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 28, borderBottom: '1px solid #e5e7eb', paddingBottom: 0 }}>
        {(['log', 'dashboard'] as const).map(v => (
          <button key={v} onClick={() => setView(v)} style={{
            padding: '8px 18px', border: 'none', cursor: 'pointer', fontWeight: 600,
            fontSize: 14, background: 'transparent', borderBottom: view === v ? '2px solid #111827' : '2px solid transparent',
            color: view === v ? '#111827' : '#9ca3af', marginBottom: -1,
          }}>
            {v === 'log' ? '+ Log Time' : `Dashboard (${entries.length})`}
          </button>
        ))}
      </div>

      {/* Log Time Form */}
      {view === 'log' && (
        <div style={{ background: '#fff', borderRadius: 12, padding: 28, border: '1px solid #e5e7eb' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: '#374151', fontWeight: 600 }}>Person</label>
                <select style={inp} value={form.person} onChange={e => setForm(f => ({ ...f, person: e.target.value }))}>
                  {PEOPLE.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: '#374151', fontWeight: 600 }}>Date</label>
                <input type="date" style={inp} value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: '#374151', fontWeight: 600 }}>Category</label>
              <select style={inp} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16, marginBottom: 22 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: '#374151', fontWeight: 600 }}>Hours</label>
                <input type="number" step="0.25" min="0.25" style={inp} placeholder="e.g. 1.5"
                  value={form.hours} onChange={e => setForm(f => ({ ...f, hours: e.target.value }))} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: '#374151', fontWeight: 600 }}>Notes (optional)</label>
                <input type="text" style={inp} placeholder="What did you work on?"
                  value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>
            {msg && <p style={{ color: msg.includes('Error') ? '#dc2626' : '#16a34a', marginBottom: 14, fontSize: 14 }}>{msg}</p>}
            <button type="submit" disabled={loading} style={{
              background: loading ? '#d1d5db' : '#111827', color: '#fff', border: 'none',
              padding: '11px 28px', borderRadius: 8, fontWeight: 600, fontSize: 15,
              cursor: loading ? 'not-allowed' : 'pointer', width: '100%',
            }}>
              {loading ? 'Saving...' : 'Log Time'}
            </button>
          </form>
        </div>
      )}

      {/* Dashboard */}
      {view === 'dashboard' && (
        <>
          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 24 }}>
            <div style={{ background: '#fff', borderRadius: 10, padding: '18px 20px', border: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#111827' }}>{grandTotal.toFixed(1)}h</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>Total Hours</div>
            </div>
            {totalByPerson.map(p => (
              <div key={p.person} style={{ background: '#fff', borderRadius: 10, padding: '18px 20px', border: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: 26, fontWeight: 700, color: '#111827' }}>{p.hours.toFixed(1)}h</div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{p.person}</div>
              </div>
            ))}
          </div>

          {/* By category */}
          <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', border: '1px solid #e5e7eb', marginBottom: 20 }}>
            <h3 style={{ margin: '0 0 14px', color: '#111827', fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>By Category</h3>
            {totalByCategory.filter(c => c.hours > 0).length === 0
              ? <p style={{ color: '#9ca3af', margin: 0, fontSize: 14 }}>No entries yet.</p>
              : totalByCategory.filter(c => c.hours > 0).map(c => (
                <div key={c.category} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid #f3f4f6', fontSize: 14 }}>
                  <span style={{ color: '#374151' }}>{c.category}</span>
                  <span style={{ color: '#111827', fontWeight: 700 }}>{c.hours.toFixed(1)}h</span>
                </div>
              ))
            }
          </div>

          {/* Entries table */}
          <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', border: '1px solid #e5e7eb' }}>
            <h3 style={{ margin: '0 0 14px', color: '#111827', fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>All Entries</h3>
            {entries.length === 0
              ? <p style={{ color: '#9ca3af', margin: 0, fontSize: 14 }}>No entries yet. Log some time!</p>
              : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        {['Date', 'Person', 'Category', 'Hours', 'Notes', ''].map(h => (
                          <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: '#9ca3af', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e5e7eb' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[...entries].sort((a, b) => b.date.localeCompare(a.date)).map(e => (
                        <tr key={e.id}>
                          <td style={{ padding: '11px 12px', borderBottom: '1px solid #f9fafb', fontSize: 14, color: '#374151', whiteSpace: 'nowrap' }}>{e.date}</td>
                          <td style={{ padding: '11px 12px', borderBottom: '1px solid #f9fafb', fontSize: 14, color: '#374151' }}>{e.person}</td>
                          <td style={{ padding: '11px 12px', borderBottom: '1px solid #f9fafb', fontSize: 13, color: '#6b7280', maxWidth: 220 }}>{e.category}</td>
                          <td style={{ padding: '11px 12px', borderBottom: '1px solid #f9fafb', fontSize: 14, color: '#111827', fontWeight: 700 }}>{e.hours}h</td>
                          <td style={{ padding: '11px 12px', borderBottom: '1px solid #f9fafb', fontSize: 13, color: '#9ca3af' }}>{e.notes || '—'}</td>
                          <td style={{ padding: '11px 12px', borderBottom: '1px solid #f9fafb' }}>
                            <button onClick={() => handleDelete(e.id)} style={{ background: 'transparent', border: 'none', color: '#d1d5db', cursor: 'pointer', fontSize: 16, padding: 0, lineHeight: 1 }}>✕</button>
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
