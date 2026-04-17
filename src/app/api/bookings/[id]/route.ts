import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { UpdateBookingPayload } from '@/types'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const bookingId = parseInt(id, 10)

  if (isNaN(bookingId)) {
    return NextResponse.json({ error: '無效的預訂 ID' }, { status: 400 })
  }

  try {
    const body = await req.json() as Partial<UpdateBookingPayload>
    const { eventName, hostId, status, date, hours } = body

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

    // Check for conflicts excluding this booking's own slots
    const conflict = await prisma.bookingSlot.findFirst({
      where: {
        slotDate,
        slotHour: { in: hours },
        bookingId: { not: bookingId },
      },
    })
    if (conflict) {
      return NextResponse.json({ error: '所選時段已被其他預訂佔用，請重新選擇' }, { status: 409 })
    }

    const updated = await prisma.$transaction(async (tx) => {
      // Delete old slots
      await tx.bookingSlot.deleteMany({ where: { bookingId } })

      // Update booking and create new slots
      return tx.booking.update({
        where: { id: bookingId },
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
    })

    return NextResponse.json({ data: updated })
  } catch (err: unknown) {
    if (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as { code: string }).code === 'P2002'
    ) {
      return NextResponse.json({ error: '所選時段已被其他預訂佔用，請重新選擇' }, { status: 409 })
    }
    if (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as { code: string }).code === 'P2025'
    ) {
      return NextResponse.json({ error: '找不到此預訂' }, { status: 404 })
    }
    return NextResponse.json({ error: '更新失敗，請重試' }, { status: 500 })
  }
}

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
