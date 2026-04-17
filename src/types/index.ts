export type BookingStatus = 'open' | 'close'

export interface Host {
  id: number
  name: string
}

export interface BookingSlot {
  id: number
  bookingId: number
  slotDate: string // ISO date string "YYYY-MM-DD"
  slotHour: number // 0–23
}

export interface Booking {
  id: number
  eventName: string
  hostId: number
  host: Host
  status: BookingStatus
  slots: BookingSlot[]
  createdAt: string
}

export interface CreateBookingPayload {
  eventName: string
  hostId: number
  status: BookingStatus
  date: string   // "YYYY-MM-DD"
  hours: number[] // e.g. [14, 15, 18]
}

export interface UpdateBookingPayload {
  eventName: string
  hostId: number
  status: BookingStatus
  date: string   // "YYYY-MM-DD"
  hours: number[]
}

export interface ApiResponse<T> {
  data?: T
  error?: string
  ok?: boolean
}
