import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { pin?: unknown }
    const pin = body.pin

    if (!pin || typeof pin !== 'string') {
      return NextResponse.json({ error: '請輸入密碼' }, { status: 400 })
    }

    const adminConfig = await prisma.adminConfig.findFirst()
    if (!adminConfig) {
      return NextResponse.json({ error: '系統錯誤，請聯絡管理員' }, { status: 500 })
    }

    const isValid = await bcrypt.compare(pin, adminConfig.pinHash)
    if (!isValid) {
      return NextResponse.json({ error: '密碼錯誤，請再試' }, { status: 401 })
    }

    const session = await getSession()
    session.isLoggedIn = true
    await session.save()

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: '系統錯誤' }, { status: 500 })
  }
}
