'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { format } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import { cn, formatHourRange } from '@/lib/utils'
import type { Booking } from '@/types'

interface SlotInfo {
  slotHour: number
  bookingId: number
  booking: {
    id: number
    eventName: string
    status: string
    host: { name: string }
  }
}

interface DayModalProps {
  date: Date | null
  slots: SlotInfo[]        // occupied slots for this day
  bookings: Booking[]      // distinct bookings on this day
  selectedHours: number[]
  loadingSlots: boolean
  onToggleHour: (hour: number) => void
  onBook: () => void
  onClose: () => void
}

const ALL_HOURS = Array.from({ length: 24 }, (_, i) => i)

export default function DayModal({
  date,
  slots,
  bookings,
  selectedHours,
  loadingSlots,
  onToggleHour,
  onBook,
  onClose,
}: DayModalProps) {
  useEffect(() => {
    if (!date) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [date, onClose])

  if (!date) return null

  const bookedHourSet = new Set(slots.map((s) => s.slotHour))

  const slotByHour = Object.fromEntries(slots.map((s) => [s.slotHour, s]))

  return (
    <AnimatePresence>
      {date && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer — full height on mobile, centred modal on desktop */}
          <motion.div
            className="fixed z-50 inset-x-0 bottom-0 md:inset-0 md:flex md:items-center md:justify-center md:px-4"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
          >
            <div className="bg-surface rounded-t-card md:rounded-card shadow-warm-lg w-full md:max-w-lg max-h-[92vh] flex flex-col">

              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gold/20 shrink-0">
                <div>
                  <h2 className="font-serif font-bold text-lg text-text-main">
                    {format(date, 'M月d日', { locale: zhTW })}
                  </h2>
                  <p className="text-xs text-muted mt-0.5">
                    {format(date, 'EEEE', { locale: zhTW })}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-bg text-muted hover:text-primary transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">

                {/* Existing bookings */}
                {bookings.length > 0 && (
                  <section>
                    <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                      當日預訂
                    </h3>
                    <div className="space-y-2">
                      {bookings.map((b) => (
                        <div
                          key={b.id}
                          className="flex items-center justify-between bg-booked-bg rounded-input px-3 py-2.5"
                        >
                          <div>
                            <p className="text-sm font-semibold text-text-main">{b.eventName}</p>
                            <p className="text-xs text-muted mt-0.5">
                              {b.host.name} ·{' '}
                              {b.slots.map((s) => formatHourRange(s.slotHour)).join('、')}
                            </p>
                          </div>
                          <span
                            className={cn(
                              'text-xs font-medium px-2 py-0.5 rounded-badge',
                              b.status === 'open'
                                ? 'bg-open-badge text-green-800'
                                : 'bg-close-badge text-red-800'
                            )}
                          >
                            {b.status === 'open' ? '開放' : '私人'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Slot grid */}
                <section>
                  <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                    選擇時段（可多選）
                  </h3>

                  {loadingSlots ? (
                    <div className="grid grid-cols-4 gap-2">
                      {ALL_HOURS.map((h) => (
                        <div key={h} className="h-12 rounded-input bg-bg animate-pulse" />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {ALL_HOURS.map((hour) => {
                        const isBooked   = bookedHourSet.has(hour)
                        const isSelected = selectedHours.includes(hour)
                        const info       = slotByHour[hour]

                        return (
                          <button
                            key={hour}
                            disabled={isBooked}
                            onClick={() => !isBooked && onToggleHour(hour)}
                            title={isBooked ? `${info?.booking.eventName} — ${info?.booking.host.name}` : undefined}
                            className={cn(
                              'flex flex-col items-center justify-center h-12 rounded-input text-xs font-medium transition-all duration-120 relative',
                              isBooked
                                ? 'bg-booked-bg text-muted cursor-not-allowed'
                                : isSelected
                                  ? 'bg-selected border-2 border-selected-border text-text-main scale-95 shadow-sm'
                                  : 'bg-available-bg text-available hover:bg-available/30 active:scale-95 cursor-pointer',
                            )}
                          >
                            <span>{String(hour).padStart(2, '0')}:00</span>
                            {isBooked && (
                              <span className="text-[9px] text-muted/70 truncate w-full text-center px-1">
                                已訂
                              </span>
                            )}
                            {isSelected && !isBooked && (
                              <span className="text-[9px] text-gold font-bold">✓</span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </section>
              </div>

              {/* Footer — sticky book button */}
              <div className="px-5 py-4 border-t border-gold/20 shrink-0">
                {selectedHours.length > 0 ? (
                  <motion.button
                    onClick={onBook}
                    className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-input transition-all duration-150 active:scale-95"
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                  >
                    建立預訂（已選 {selectedHours.length} 個時段）
                  </motion.button>
                ) : (
                  <p className="text-center text-sm text-muted">
                    點選上方可用時段以建立預訂
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
