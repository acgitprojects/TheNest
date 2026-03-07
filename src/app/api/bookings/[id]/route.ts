import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const bookingId = parseInt(id, 10)

  if (isNaN(bookingId)) {
    return NextResponse.json({ error: '無效的預訂 ID' }, { status: 400 })
  }

  try {
    await prisma.booking.delete({ where: { id: bookingId } })
    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    if (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as { code: string }).code === 'P2025'
    ) {
      return NextResponse.json({ error: '找不到此預訂' }, { status: 404 })
    }
    return NextResponse.json({ error: '取消失敗，請重試' }, { status: 500 })
  }
}
