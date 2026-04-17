'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, CheckCheck, X, Pencil } from 'lucide-react'
import { format } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import { cn, formatHourRange } from '@/lib/utils'
import { COPY_CONFIRMATION_TEMPLATE } from '@/lib/constants'
import type { Booking } from '@/types'

interface BookingDetailModalProps {
  booking: Booking | null
  open: boolean
  onClose: () => void
  onEdit?: (booking: Booking) => void
}

export default function BookingDetailModal({
  booking,
  open,
  onClose,
  onEdit,
}: BookingDetailModalProps) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!open) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!booking) return null

  const sortedSlots = [...booking.slots].sort((a, b) => a.slotHour - b.slotHour)
  const firstSlot = sortedSlots[0]
  const dateStr = format(new Date(firstSlot.slotDate), 'yyyy年M月d日 EEEE', {
    locale: zhTW,
  })
  const timeStr = sortedSlots.map((s) => formatHourRange(s.slotHour)).join('、')

  async function handleRegenerateInvitation() {
    const text = COPY_CONFIRMATION_TEMPLATE(dateStr, timeStr, booking!.eventName)

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

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          >
            <div className="bg-surface rounded-card shadow-warm-lg p-6 w-full max-w-sm max-h-[80vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <h2 className="font-semibold text-text-main text-lg">預訂詳情</h2>
                <button
                  onClick={onClose}
                  className="p-1 rounded-input text-muted hover:text-primary hover:bg-bg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Booking Details */}
              <div className="space-y-4 mb-6">
                {/* Event Name */}
                <div>
                  <p className="text-xs text-muted uppercase tracking-wide mb-1">活動名稱</p>
                  <p className="font-semibold text-text-main">{booking.eventName}</p>
                </div>

                {/* Date */}
                <div>
                  <p className="text-xs text-muted uppercase tracking-wide mb-1">日期</p>
                  <p className="text-text-main">{dateStr}</p>
                </div>

                {/* Time Slots */}
                <div>
                  <p className="text-xs text-muted uppercase tracking-wide mb-1">時段</p>
                  <p className="text-text-main">{timeStr}</p>
                </div>

                {/* Host */}
                <div>
                  <p className="text-xs text-muted uppercase tracking-wide mb-1">負責人</p>
                  <p className="text-text-main">{booking.host.name}</p>
                </div>

                {/* Status */}
                <div>
                  <p className="text-xs text-muted uppercase tracking-wide mb-1">狀態</p>
                  <span
                    className={cn(
                      'text-sm font-medium px-2 py-0.5 rounded-badge',
                      booking.status === 'open'
                        ? 'bg-open-badge text-green-800'
                        : 'bg-close-badge text-red-800'
                    )}
                  >
                    {booking.status === 'open' ? '開放' : '私人'}
                  </span>
                </div>
              </div>

              {/* Edit Button */}
              {onEdit && (
                <button
                  onClick={() => onEdit(booking)}
                  className="w-full mb-2 py-2.5 px-4 rounded-input font-medium text-sm flex items-center justify-center gap-2 transition-all duration-150 active:scale-95 bg-bg hover:bg-gold-light border border-gold/30 text-text-main"
                >
                  <Pencil size={16} />
                  編輯活動
                </button>
              )}

              {/* Regenerate Invitation Button */}
              <button
                onClick={handleRegenerateInvitation}
                className={cn(
                  'w-full py-2.5 px-4 rounded-input font-medium text-sm flex items-center justify-center gap-2 transition-all duration-150 active:scale-95',
                  copied
                    ? 'bg-open-badge text-green-800'
                    : 'bg-primary hover:bg-primary-dark text-white'
                )}
              >
                {copied ? (
                  <>
                    <CheckCheck size={16} />
                    已複製
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    重新生成邀請
                  </>
                )}
              </button>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="w-full mt-3 py-2.5 px-4 rounded-input font-medium text-sm text-muted bg-bg hover:bg-gold-light transition-colors duration-150"
              >
                關閉
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
