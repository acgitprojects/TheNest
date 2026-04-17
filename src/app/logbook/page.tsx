'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import { BookOpen, Pencil, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Nav from '@/components/Nav'
import ConfirmDialog from '@/components/ConfirmDialog'
import BookingDetailModal from '@/components/BookingDetailModal'
import EditBookingModal from '@/components/EditBookingModal'
import { cn, formatHourRange } from '@/lib/utils'
import type { Booking, Host } from '@/types'

export default function LogbookPage() {
  const [bookings, setBookings]           = useState<Booking[]>([])
  const [hosts, setHosts]                 = useState<Host[]>([])
  const [loading, setLoading]             = useState(true)
  const [cancelTarget, setCancelTarget]   = useState<number | null>(null)
  const [cancelling, setCancelling]       = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [editingBooking, setEditingBooking]   = useState<Booking | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/bookings').then((r) => r.json()),
      fetch('/api/hosts').then((r) => r.json()),
    ]).then(([bookingsRes, hostsRes]: [{ data: Booking[] }, { data: Host[] }]) => {
      setBookings(bookingsRes.data)
      setHosts(hostsRes.data)
    }).finally(() => setLoading(false))
  }, [])

  function handleEditBooking(booking: Booking) {
    setSelectedBooking(null)
    setEditingBooking(booking)
  }

  function handleEditSaved(updated: Booking) {
    setBookings((prev) => prev.map((b) => b.id === updated.id ? updated : b))
    setEditingBooking(null)
    toast.success('預訂已更新')
  }

  async function handleConfirmCancel() {
    if (!cancelTarget) return
    setCancelling(true)

    try {
      const res = await fetch(`/api/bookings/${cancelTarget}`, { method: 'DELETE' })
      if (!res.ok) {
        const { error } = await res.json() as { error: string }
        throw new Error(error)
      }
      setBookings((prev) => prev.filter((b) => b.id !== cancelTarget))
      toast.success('預訂已取消')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : '取消失敗')
    } finally {
      setCancelling(false)
      setCancelTarget(null)
    }
  }

  return (
    <>
      <Nav />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <BookOpen size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="font-serif font-bold text-2xl text-text-main">預訂記錄</h1>
            <p className="text-sm text-muted">所有預訂，由最新排列</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-card bg-surface animate-pulse shadow-card" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <span className="text-5xl mb-4 block">🪺</span>
            <p className="text-muted text-sm">尚未有任何預訂</p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {bookings.map((booking, idx) => {
                const sortedSlots = [...booking.slots].sort((a, b) => a.slotHour - b.slotHour)
                const firstSlot   = sortedSlots[0]
                const dateStr     = format(
                  new Date(firstSlot.slotDate),
                  'yyyy年M月d日 EEEE',
                  { locale: zhTW }
                )

                return (
                  <motion.div
                    key={booking.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                    transition={{ delay: idx * 0.04, duration: 0.25 }}
                    className="bg-surface rounded-card shadow-card p-4 flex items-start justify-between gap-3 cursor-pointer hover:shadow-warm-md transition-all active:scale-[0.98]"
                    onClick={() => setSelectedBooking(booking)}
                  >
                    {/* Left info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold text-text-main text-sm truncate">
                          {booking.eventName}
                        </span>
                        <span
                          className={cn(
                            'text-xs font-medium px-2 py-0.5 rounded-badge shrink-0',
                            booking.status === 'open'
                              ? 'bg-open-badge text-green-800'
                              : 'bg-close-badge text-red-800'
                          )}
                        >
                          {booking.status === 'open' ? '開放' : '私人'}
                        </span>
                      </div>

                      <p className="text-xs text-muted">{dateStr}</p>

                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {sortedSlots.map((s) => (
                          <span
                            key={s.id}
                            className="text-xs bg-bg text-muted px-1.5 py-0.5 rounded-badge"
                          >
                            {formatHourRange(s.slotHour)}
                          </span>
                        ))}
                      </div>

                      <p className="text-xs text-muted mt-1.5">
                        負責人：<span className="font-medium text-text-main">{booking.host.name}</span>
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditBooking(booking)
                        }}
                        className="p-2 rounded-input text-muted hover:text-gold hover:bg-gold-light transition-colors"
                        title="編輯預訂"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setCancelTarget(booking.id)
                        }}
                        className="p-2 rounded-input text-muted hover:text-primary hover:bg-booked-bg transition-colors"
                        title="取消預訂"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Booking detail modal */}
      <BookingDetailModal
        booking={selectedBooking}
        open={selectedBooking !== null}
        onClose={() => setSelectedBooking(null)}
        onEdit={handleEditBooking}
      />

      {/* Edit booking modal */}
      <EditBookingModal
        booking={editingBooking}
        open={editingBooking !== null}
        hosts={hosts}
        onClose={() => setEditingBooking(null)}
        onSaved={handleEditSaved}
      />

      {/* Cancel confirmation */}
      <ConfirmDialog
        open={cancelTarget !== null}
        title="確定取消此預訂？"
        message="取消後將無法復原，時段會立即釋出。"
        confirmLabel={cancelling ? '處理中⋯' : '確定取消'}
        cancelLabel="返回"
        danger
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancelTarget(null)}
      />
    </>
  )
}
