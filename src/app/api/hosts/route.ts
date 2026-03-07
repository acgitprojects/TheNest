import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const hosts = await prisma.host.findMany({ orderBy: { id: 'asc' } })
    return NextResponse.json({ data: hosts })
  } catch {
    return NextResponse.json({ error: '無法載入主持人列表' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { name?: unknown }
    const name = typeof body.name === 'string' ? body.name.trim() : ''

    if (!name) {
      return NextResponse.json({ error: '請輸入主持人姓名' }, { status: 400 })
    }

    const host = await prisma.host.create({ data: { name } })
    return NextResponse.json({ data: host }, { status: 201 })
  } catch {
    return NextResponse.json({ error: '新增失敗，請重試' }, { status: 500 })
  }
}
