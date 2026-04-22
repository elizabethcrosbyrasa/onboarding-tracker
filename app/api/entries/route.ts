import { NextResponse } from 'next/server'
import { put, head } from '@vercel/blob'

const BLOB_KEY = 'onboarding-tracker/entries.json'

async function getEntries(): Promise<any[]> {
  try {
    const blob = await head(BLOB_KEY)
    if (!blob) return []
    const res = await fetch(blob.url, { cache: 'no-store' })
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

async function saveEntries(entries: any[]) {
  await put(BLOB_KEY, JSON.stringify(entries), {
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
  const entry = await req.json()
  const entries = await getEntries()
  entries.push(entry)
  await saveEntries(entries)
  return NextResponse.json({ success: true })
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  const entries = await getEntries()
  const filtered = entries.filter((e: any) => e.id !== id)
  await saveEntries(filtered)
  return NextResponse.json({ success: true })
}
