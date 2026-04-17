'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import Nav from '@/components/Nav'
import CalendarGrid from '@/components/Calendar/CalendarGrid'
import DayModal from '@/components/Calendar/DayModal'
import BookingForm from '@/components/Calendar/BookingForm'
import { HOSTS_FALLBACK } from '@/lib/constants'
import type { Booking, Host, CreateBookingPayload } from '@/types'

type ModalStep = 'day' | 'form' | null

export default function CalendarPage() {
  const router = useRouter()

  const [hosts, setHosts]               = useState<Host[]>(HOSTS_FALLBACK)
  const [allBookings, setAllBookings]   = useState<Booking[]>([])
  const [daySlots, setDaySlots]         = useState<Parameters<typeof DayModal>[0]['slots']>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedHours, setSelectedHours] = useState<number[]>([])
  const [modalStep, setModalStep]       = useState<ModalStep>(null)

  // Load hosts and all bookings on mount
  useEffect(() => {
    async function load() {
      const [hostsRes, bookingsRes] = await Promise.all([
        fetch('/api/hosts'),
        fetch('/api/bookings'),
      ])
      if (hostsRes.ok) {
        const { data } = await hostsRes.json() as { data: Host[] }
        if (data && data.length > 0) setHosts(data)
      }
      if (bookingsRes.ok) {
        const { data } = await bookingsRes.json() as { data: Booking[] }
        setAllBookings(data)
      }
    }
    load()
  }, [])

  // Derive booked dates map (date -> booking count) for calendar dots
  const bookedDates = allBookings.reduce<Record<string, number>>((acc, b) => {
    const dateStr = b.slots[0]?.slotDate.split('T')[0]
    if (dateStr) acc[dateStr] = (acc[dateStr] ?? 0) + 1
    return acc
  }, {})

  // Load slots for a specific date
  const loadDaySlots = useCallback(async (date: Date) => {
    setLoadingSlots(true)
    try {
      const dateStr = format(date, 'yyyy-MM-dd')
      const res = await fetch(`/api/slots?date=${dateStr}`)
      if (res.ok) {
        const { data } = await res.json() as { data: Parameters<typeof DayModal>[0]['slots'] }
        setDaySlots(data)
      }
    } finally {
      setLoadingSlots(false)
    }
  }, [])

  function handleDayClick(date: Date) {
    setSelectedDate(date)
    setSelectedHours([])
    setModalStep('day')
    loadDaySlots(date)
  }

  function handleToggleHour(hour: number) {
    setSelectedHours((prev) =>
      prev.includes(hour) ? prev.filter((h) => h !== hour) : [...prev, hour]
    )
  }

  function handleOpenForm() {
    setModalStep('form')
  }

  function handleBackToDay() {
    setModalStep('day')
  }

  function handleClose() {
    setModalStep(null)
    setSelectedDate(null)
    setSelectedHours([])
    setDaySlots([])
  }

  async function handleCreateBooking(payload: CreateBookingPayload) {
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const data = await res.json() as { data?: Booking; error?: string }

    if (!res.ok) {
      throw new Error(data.error ?? '預訂失敗')
    }

    // Update local booking state
    setAllBookings((prev) => [...prev, data.data!])
    handleClose()
    toast.success('預訂成功！')

    // Navigate to confirmation with booking data
    router.push(
      `/confirmation?bookingId=${data.data!.id}`
    )
  }

  // Bookings on the selected day
  const dayBookings = selectedDate
    ? allBookings.filter((b) =>
        b.slots.some(
          (s) => s.slotDate.split('T')[0] === format(selectedDate, 'yyyy-MM-dd')
        )
      )
    : []

  return (
    <>
      <Nav />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="font-serif font-bold text-2xl text-text-main">預訂日曆</h1>
          <p className="text-sm text-muted mt-1">點擊任意日期查看時段及預訂</p>
        </div>

        <CalendarGrid
          bookedDates={bookedDates}
          onDayClick={handleDayClick}
        />
      </main>

      {/* Day detail modal */}
      {modalStep === 'day' && selectedDate && (
        <DayModal
          date={selectedDate}
          slots={daySlots}
          bookings={dayBookings}
          selectedHours={selectedHours}
          loadingSlots={loadingSlots}
          onToggleHour={handleToggleHour}
          onBook={handleOpenForm}
          onClose={handleClose}
        />
      )}

      {/* Booking form modal */}
      {modalStep === 'form' && selectedDate && (
        <BookingForm
          date={selectedDate}
          selectedHours={selectedHours}
          hosts={hosts}
          onSubmit={handleCreateBooking}
          onBack={handleBackToDay}
          onClose={handleClose}
        />
      )}
    </>
  )
}
