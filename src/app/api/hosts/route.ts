import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const hosts = await prisma.host.findMany({ orderBy: { id: 'asc' } })
    return NextResponse.json({ data: hosts })
  } catch {
    return NextResponse.json({ error: '無法載入主持人列表' }, { status: 500 })
  }
}
