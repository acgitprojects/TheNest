import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { CreateBookingPayload } from '@/types'

export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        host: true,
        slots: { orderBy: { slotHour: 'asc' } },
      },
      orderBy: [
        // Sort by the earliest slot date of each booking, latest first
        { createdAt: 'desc' },
      ],
    })

    // Sort by earliest slot date descending
    const sorted = bookings.sort((a, b) => {
      const aDate = a.slots[0]?.slotDate ?? a.createdAt
      const bDate = b.slots[0]?.slotDate ?? b.createdAt
      return new Date(bDate).getTime() - new Date(aDate).getTime()
    })

    return NextResponse.json({ data: sorted })
  } catch {
    return NextResponse.json({ error: '無法載入預訂記錄' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Partial<CreateBookingPayload>
    const { eventName, hostId, status, date, hours } = body

    // Validate required fields
    if (!eventName || typeof eventName !== 'string' || eventName.trim() === '') {
      return NextResponse.json({ error: '請輸入活動名稱' }, { status: 400 })
    }
    if (!hostId || typeof hostId !== 'number') {
      return NextResponse.json({ error: '請選擇負責人' }, { status: 400 })
    }
    if (!status || !['open', 'close'].includes(status)) {
      return NextResponse.json({ error: '請選擇狀態' }, { status: 400 })
    }
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: '請提供有效日期' }, { status: 400 })
    }
    if (!hours || !Array.isArray(hours) || hours.length === 0) {
      return NextResponse.json({ error: '請選擇時段' }, { status: 400 })
    }
    if (hours.some((h) => typeof h !== 'number' || h < 0 || h > 23)) {
      return NextResponse.json({ error: '時段資料無效' }, { status: 400 })
    }

    const slotDate = new Date(date)

    // Check for conflicts
    const conflicts = await prisma.bookingSlot.findFirst({
      where: {
        slotDate,
        slotHour: { in: hours },
      },
    })
    if (conflicts) {
      return NextResponse.json({ error: '所選時段已被預訂，請重新選擇' }, { status: 409 })
    }

    // Create booking with slots in a transaction
    const booking = await prisma.$transaction(async (tx) => {
      const newBooking = await tx.booking.create({
        data: {
          eventName: eventName.trim(),
          hostId,
          status,
          slots: {
            create: hours.map((h) => ({
              slotDate,
              slotHour: h,
            })),
          },
        },
        include: {
          host: true,
          slots: { orderBy: { slotHour: 'asc' } },
        },
      })
      return newBooking
    })

    return NextResponse.json({ data: booking }, { status: 201 })
  } catch (err: unknown) {
    // Unique constraint violation = double booking race condition
    if (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as { code: string }).code === 'P2002'
    ) {
      return NextResponse.json({ error: '所選時段已被預訂，請重新選擇' }, { status: 409 })
    }
    return NextResponse.json({ error: '預訂失敗，請重試' }, { status: 500 })
  }
}
