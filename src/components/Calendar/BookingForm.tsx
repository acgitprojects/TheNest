'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { format } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import { formatHourRange } from '@/lib/utils'
import type { Host, CreateBookingPayload, BookingStatus } from '@/types'

interface BookingFormProps {
  date: Date
  selectedHours: number[]
  hosts: Host[]
  onSubmit: (payload: CreateBookingPayload) => Promise<void>
  onBack: () => void
  onClose: () => void
}

export default function BookingForm({
  date,
  selectedHours,
  hosts,
  onSubmit,
  onBack,
  onClose,
}: BookingFormProps) {
  const [eventName, setEventName] = useState('')
  const [hostId, setHostId]       = useState<number | ''>('')
  const [status, setStatus]       = useState<BookingStatus>('open')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!eventName.trim() || !hostId) return

    setLoading(true)
    setError('')

    try {
      await onSubmit({
        eventName: eventName.trim(),
        hostId: hostId as number,
        status,
        date: format(date, 'yyyy-MM-dd'),
        hours: [...selectedHours].sort((a, b) => a - b),
      })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '預訂失敗，請重試')
    } finally {
      setLoading(false)
    }
  }

  const sortedHours = [...selectedHours].sort((a, b) => a - b)

  return (
    <AnimatePresence>
      <>
        {/* Backdrop */}
        <motion.div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        {/* Form modal */}
        <motion.div
          className="fixed z-50 inset-x-0 bottom-0 md:inset-0 md:flex md:items-center md:justify-center md:px-4"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        >
          <div className="bg-surface rounded-t-card md:rounded-card shadow-warm-lg w-full md:max-w-md p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-serif font-bold text-lg text-text-main">建立預訂</h2>
                <p className="text-sm text-muted mt-0.5">
                  {format(date, 'M月d日 EEEE', { locale: zhTW })}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-bg text-muted hover:text-primary transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Selected slots summary */}
            <div className="bg-selected/50 border border-selected-border rounded-input p-3 mb-5">
              <p className="text-xs font-semibold text-gold mb-1.5">已選時段</p>
              <div className="flex flex-wrap gap-1.5">
                {sortedHours.map((h) => (
                  <span
                    key={h}
                    className="text-xs bg-gold/20 text-text-main px-2 py-0.5 rounded-badge font-medium"
                  >
                    {formatHourRange(h)}
                  </span>
                ))}
              </div>
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
                  autoFocus
                  className="w-full bg-bg border-2 border-gold/30 focus:border-primary outline-none rounded-input px-4 py-2.5 text-sm text-text-main placeholder:text-muted/50 transition-colors"
                />
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
                      className={`flex-1 py-2.5 rounded-input text-sm font-medium border-2 transition-all duration-150 ${
                        status === s
                          ? s === 'open'
                            ? 'bg-open-badge border-green-400 text-green-800'
                            : 'bg-close-badge border-red-300 text-red-800'
                          : 'bg-bg border-gold/30 text-muted hover:border-gold/50'
                      }`}
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
                  onClick={onBack}
                  className="flex-1 py-3 rounded-input text-sm font-medium text-muted bg-bg hover:bg-gold-light border border-gold/30 transition-colors"
                >
                  返回
                </button>
                <button
                  type="submit"
                  disabled={!eventName.trim() || !hostId || loading}
                  className="flex-1 py-3 rounded-input text-sm font-semibold text-white bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 active:scale-95"
                >
                  {loading ? '處理中⋯' : '確認預訂'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </>
    </AnimatePresence>
  )
}
