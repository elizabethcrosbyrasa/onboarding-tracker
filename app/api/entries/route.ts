import { NextResponse } from 'next/server'
import { put, list } from '@vercel/blob'

const BLOB_PATH = 'onboarding-tracker/entries.json'

async function getEntries(): Promise<any[]> {
  try {
    const { blobs } = await list({ prefix: BLOB_PATH, limit: 1 })
    if (!blobs.length) return []
    const res = await fetch(blobs[0].url, { cache: 'no-store' })
    if (!res.ok) return []
    return await res.json()
  } catch (e) {
    console.error('getEntries error:', e)
    return []
  }
}

async function saveEntries(entries: any[]) {
  await put(BLOB_PATH, JSON.stringify(entries), {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
  })
}

export async function GET() {
  const entries = await getEntries()
  return NextResponse.json({ entries })
}

export async function POST(req: Request) {
  try {
    const entry = await req.json()
    const entries = await getEntries()
    entries.push(entry)
    await saveEntries(entries)
    return NextResponse.json({ success: true, entry })
  } catch (e) {
    console.error('POST error:', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'No id provided' }, { status: 400 })
    const entries = await getEntries()
    const filtered = entries.filter((e: any) => e.id !== id)
    await saveEntries(filtered)
    return NextResponse.json({ success: true, remaining: filtered.length })
  } catch (e) {
    console.error('DELETE error:', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
