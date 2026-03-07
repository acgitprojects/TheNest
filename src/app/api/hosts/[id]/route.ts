import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const hostId = parseInt(id, 10)

  if (isNaN(hostId)) {
    return NextResponse.json({ error: '無效的主持人 ID' }, { status: 400 })
  }

  try {
    await prisma.host.delete({ where: { id: hostId } })
    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    const code = typeof err === 'object' && err !== null && 'code' in err
      ? (err as { code: string }).code
      : ''

    if (code === 'P2025') {
      return NextResponse.json({ error: '找不到此主持人' }, { status: 404 })
    }
    if (code === 'P2003') {
      return NextResponse.json({ error: '此主持人仍有關聯預訂，無法刪除' }, { status: 409 })
    }
    return NextResponse.json({ error: '刪除失敗，請重試' }, { status: 500 })
  }
}
