import { NextResponse } from 'next/server'
import { put, list, del } from '@vercel/blob'

// Each entry is stored as its own blob file
// This avoids all overwrite/race condition issues
const ENTRY_PREFIX = 'onboarding-tracker/entry-'

async function getEntries(): Promise<any[]> {
  try {
    const { blobs } = await list({ prefix: ENTRY_PREFIX })
    const entries = await Promise.all(
      blobs.map(async (b) => {
        const res = await fetch(b.url, { cache: 'no-store' })
        if (!res.ok) return null
        return res.json()
      })
    )
    return entries.filter(Boolean)
  } catch (e) {
    console.error('getEntries error:', e)
    return []
  }
}

export async function GET() {
  const entries = await getEntries()
  // Sort by date desc, then id desc
  entries.sort((a: any, b: any) => {
    if (b.date !== a.date) return b.date.localeCompare(a.date)
    return b.id.localeCompare(a.id)
  })
  return NextResponse.json({ entries })
}

export async function POST(req: Request) {
  try {
    const entry = await req.json()
    if (!entry.id) return NextResponse.json({ error: 'No id' }, { status: 400 })
    await put(`${ENTRY_PREFIX}${entry.id}.json`, JSON.stringify(entry), {
      access: 'public',
      addRandomSuffix: false,
    })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('POST error:', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'No id' }, { status: 400 })

    // Find the blob for this entry id
    const { blobs } = await list({ prefix: `${ENTRY_PREFIX}${id}` })
    if (blobs.length > 0) {
      await del(blobs.map(b => b.url))
    }
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('DELETE error:', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
