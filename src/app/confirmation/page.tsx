'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Copy, CheckCheck, CalendarDays, MapPin, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import Nav from '@/components/Nav'
import { VENUE_ADDRESS, WELCOME_MESSAGE, COPY_CONFIRMATION_TEMPLATE } from '@/lib/constants'
import { formatHourRange } from '@/lib/utils'
import type { Booking } from '@/types'

function ConfirmationContent() {
  const params  = useSearchParams()
  const router  = useRouter()
  const bookingId = params.get('bookingId')

  const [booking, setBooking] = useState<Booking | null>(null)
  const [copied, setCopied]   = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!bookingId) return
    fetch('/api/bookings')
      .then((r) => r.json())
      .then(({ data }: { data: Booking[] }) => {
        const found = data.find((b) => b.id === Number(bookingId))
        setBooking(found ?? null)
      })
      .finally(() => setLoading(false))
  }, [bookingId])

  async function handleCopy() {
    if (!booking) return

    const firstSlot = booking.slots[0]
    const dateStr = format(new Date(firstSlot.slotDate), 'yyyy年M月d日 EEEE', { locale: zhTW })
    const timeStr = [...booking.slots]
      .sort((a, b) => a.slotHour - b.slotHour)
      .map((s) => formatHourRange(s.slotHour))
      .join('、')

    const text = COPY_CONFIRMATION_TEMPLATE(dateStr, timeStr, booking.eventName)

    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // fallback for non-HTTPS
      const el = document.createElement('textarea')
      el.value = text
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="text-center py-20 text-muted">
        <p>找不到預訂資料</p>
        <button onClick={() => router.push('/calendar')} className="mt-4 text-primary hover:underline text-sm">
          返回日曆
        </button>
      </div>
    )
  }

  const sortedSlots = [...booking.slots].sort((a, b) => a.slotHour - b.slotHour)
  const firstSlot   = sortedSlots[0]
  const dateStr     = format(new Date(firstSlot.slotDate), 'yyyy年M月d日 EEEE', { locale: zhTW })

  return (
    <main className="max-w-lg mx-auto px-4 py-10">

      {/* Success animation */}
      <motion.div
        className="flex justify-center mb-8"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 240, damping: 18, delay: 0.1 }}
      >
        <div className="w-20 h-20 rounded-full bg-open-badge flex items-center justify-center shadow-warm-md">
          <motion.span
            className="text-3xl"
            animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            🪺
          </motion.span>
        </div>
      </motion.div>

      <motion.h1
        className="font-serif font-bold text-2xl text-center text-text-main mb-1"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        預訂成功！
      </motion.h1>

      <motion.p
        className="text-center text-muted text-sm mb-8 whitespace-pre-line"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {WELCOME_MESSAGE}
      </motion.p>

      {/* Booking card */}
      <motion.div
        className="bg-surface rounded-card shadow-warm p-5 space-y-4 mb-6"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <div className="flex items-start gap-3">
          <CalendarDays size={18} className="text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-muted">日期</p>
            <p className="text-sm font-semibold text-text-main mt-0.5">{dateStr}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Clock size={18} className="text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-muted">時段</p>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {sortedSlots.map((s) => (
                <span
                  key={s.id}
                  className="text-xs bg-selected border border-selected-border text-text-main px-2 py-0.5 rounded-badge font-medium"
                >
                  {formatHourRange(s.slotHour)}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <span className="text-primary mt-0.5 shrink-0 text-base">🎉</span>
          <div>
            <p className="text-xs text-muted">活動名稱</p>
            <p className="text-sm font-semibold text-text-main mt-0.5">{booking.eventName}</p>
          </div>
        </div>

        <div className="border-t border-gold/20 pt-4 flex items-start gap-3">
          <MapPin size={18} className="text-gold mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-muted">地址</p>
            <p className="text-sm font-medium text-text-main mt-0.5 leading-relaxed">
              {VENUE_ADDRESS}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        className="flex flex-col gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <button
          onClick={handleCopy}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-input font-semibold text-white bg-primary hover:bg-primary-dark transition-all duration-150 active:scale-95"
        >
          {copied ? <CheckCheck size={18} /> : <Copy size={18} />}
          {copied ? '已複製！' : '複製資訊'}
        </button>

        <button
          onClick={() => router.push('/calendar')}
          className="w-full py-3 rounded-input font-medium text-muted bg-bg hover:bg-gold-light border border-gold/30 transition-colors text-sm"
        >
          返回日曆
        </button>
      </motion.div>
    </main>
  )
}

export default function ConfirmationPage() {
  return (
    <>
      <Nav />
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <ConfirmationContent />
      </Suspense>
    </>
  )
}
