import { NextResponse } from 'next/server'
import { put, list, del } from '@vercel/blob'

const BLOB_FILENAME = 'onboarding-tracker/entries.json'

async function getEntries(): Promise<any[]> {
  try {
    const { blobs } = await list({ prefix: BLOB_FILENAME })
    if (!blobs.length) return []
    // Sort by uploadedAt to get the most recent
    blobs.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
    const res = await fetch(blobs[0].url + '?t=' + Date.now())
    if (!res.ok) return []
    return await res.json()
  } catch (e) {
    console.error('getEntries error:', e)
    return []
  }
}

async function saveEntries(entries: any[]) {
  // Delete all existing blobs with this prefix first
  const { blobs } = await list({ prefix: BLOB_FILENAME })
  if (blobs.length > 0) {
    await del(blobs.map(b => b.url))
  }
  // Write fresh
  await put(BLOB_FILENAME, JSON.stringify(entries), {
    access: 'public',
    addRandomSuffix: false,
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
    const entries = await getEntries()
    const filtered = entries.filter((e: any) => e.id !== id)
    await saveEntries(filtered)
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('DELETE error:', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
