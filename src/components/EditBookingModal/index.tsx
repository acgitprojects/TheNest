'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn, formatHourRange } from '@/lib/utils'
import type { Booking, Host, BookingStatus } from '@/types'

interface EditBookingModalProps {
  booking: Booking | null
  open: boolean
  hosts: Host[]
  onClose: () => void
  onSaved: (updated: Booking) => void
}

const ALL_HOURS = Array.from({ length: 24 }, (_, i) => i)

export default function EditBookingModal({
  booking,
  open,
  hosts,
  onClose,
  onSaved,
}: EditBookingModalProps) {
  const [eventName, setEventName] = useState('')
  const [hostId, setHostId]       = useState<number | ''>('')
  const [status, setStatus]       = useState<BookingStatus>('open')
  const [date, setDate]           = useState('')
  const [selectedHours, setSelectedHours] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  // Close on Escape
  useEffect(() => {
    if (!open) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  // Sync form fields whenever the target booking changes
  useEffect(() => {
    if (booking) {
      setEventName(booking.eventName)
      setHostId(booking.hostId)
      setStatus(booking.status)
      setDate(booking.slots[0]?.slotDate.slice(0, 10) ?? '')
      setSelectedHours(booking.slots.map((s) => s.slotHour))
      setError('')
    }
  }, [booking])

  function toggleHour(h: number) {
    setSelectedHours((prev) =>
      prev.includes(h) ? prev.filter((x) => x !== h) : [...prev, h]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!booking || !eventName.trim() || !hostId || !date || selectedHours.length === 0) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventName: eventName.trim(),
          hostId: hostId as number,
          status,
          date,
          hours: [...selectedHours].sort((a, b) => a - b),
        }),
      })

      const json = await res.json() as { data?: Booking; error?: string }

      if (!res.ok) {
        throw new Error(json.error ?? '更新失敗，請重試')
      }

      onSaved(json.data!)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '更新失敗，請重試')
    } finally {
      setLoading(false)
    }
  }

  if (!booking) return null

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed z-[70] inset-x-0 bottom-0 md:inset-0 md:flex md:items-center md:justify-center md:px-4"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
          >
            <div className="bg-surface rounded-t-card md:rounded-card shadow-warm-lg w-full md:max-w-md max-h-[92vh] overflow-y-auto">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="font-serif font-bold text-lg text-text-main">編輯預訂</h2>
                    <p className="text-sm text-muted mt-0.5">修改活動資訊</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-bg text-muted hover:text-primary transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Event name */}
                  <div>
                    <label className="block text-sm font-medium text-text-main mb-1.5">
                      活動名稱 <span className="text-primary">*</span>
                    </label>
                    <input
                      type="text"
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value)}
                      placeholder="輸入活動名稱"
                      maxLength={100}
                      className="w-full bg-bg border-2 border-gold/30 focus:border-primary outline-none rounded-input px-4 py-2.5 text-sm text-text-main placeholder:text-muted/50 transition-colors"
                    />
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-sm font-medium text-text-main mb-1.5">
                      日期 <span className="text-primary">*</span>
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-bg border-2 border-gold/30 focus:border-primary outline-none rounded-input px-4 py-2.5 text-sm text-text-main transition-colors"
                    />
                  </div>

                  {/* Hours grid */}
                  <div>
                    <label className="block text-sm font-medium text-text-main mb-2">
                      時段 <span className="text-primary">*</span>
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {ALL_HOURS.map((h) => {
                        const selected = selectedHours.includes(h)
                        return (
                          <button
                            key={h}
                            type="button"
                            onClick={() => toggleHour(h)}
                            className={cn(
                              'py-1.5 px-1 rounded-input text-xs font-medium border transition-all duration-100',
                              selected
                                ? 'bg-primary border-primary text-white'
                                : 'bg-bg border-gold/30 text-muted hover:border-gold/60'
                            )}
                          >
                            {formatHourRange(h).split(' – ')[0]}
                          </button>
                        )
                      })}
                    </div>
                    {selectedHours.length > 0 && (
                      <p className="text-xs text-muted mt-1.5">
                        已選：{[...selectedHours].sort((a, b) => a - b).map((h) => formatHourRange(h)).join('、')}
                      </p>
                    )}
                  </div>

                  {/* Host */}
                  <div>
                    <label className="block text-sm font-medium text-text-main mb-1.5">
                      負責人 <span className="text-primary">*</span>
                    </label>
                    <select
                      value={hostId}
                      onChange={(e) => setHostId(Number(e.target.value))}
                      className="w-full bg-bg border-2 border-gold/30 focus:border-primary outline-none rounded-input px-4 py-2.5 text-sm text-text-main transition-colors appearance-none cursor-pointer"
                    >
                      <option value="">選擇負責人</option>
                      {hosts.map((h) => (
                        <option key={h.id} value={h.id}>{h.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Status toggle */}
                  <div>
                    <label className="block text-sm font-medium text-text-main mb-2">
                      狀態 <span className="text-primary">*</span>
                    </label>
                    <div className="flex gap-2">
                      {(['open', 'close'] as BookingStatus[]).map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setStatus(s)}
                          className={cn(
                            'flex-1 py-2.5 rounded-input text-sm font-medium border-2 transition-all duration-150',
                            status === s
                              ? s === 'open'
                                ? 'bg-open-badge border-green-400 text-green-800'
                                : 'bg-close-badge border-red-300 text-red-800'
                              : 'bg-bg border-gold/30 text-muted hover:border-gold/50'
                          )}
                        >
                          {s === 'open' ? '🟢 開放' : '🔴 私人'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Error */}
                  <AnimatePresence>
                    {error && (
                      <motion.p
                        className="text-sm text-primary"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                      >
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 py-3 rounded-input text-sm font-medium text-muted bg-bg hover:bg-gold-light border border-gold/30 transition-colors"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      disabled={!eventName.trim() || !hostId || !date || selectedHours.length === 0 || loading}
                      className="flex-1 py-3 rounded-input text-sm font-semibold text-white bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 active:scale-95"
                    >
                      {loading ? '更新中⋯' : '儲存更改'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
