import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const date = searchParams.get('date')

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: '請提供有效日期 (YYYY-MM-DD)' }, { status: 400 })
  }

  try {
    const slots = await prisma.bookingSlot.findMany({
      where: { slotDate: new Date(date) },
      select: {
        slotHour: true,
        bookingId: true,
        booking: {
          select: {
            id: true,
            eventName: true,
            status: true,
            host: { select: { name: true } },
          },
        },
      },
    })

    return NextResponse.json({ data: slots })
  } catch {
    return NextResponse.json({ error: '無法載入時段資料' }, { status: 500 })
  }
}
