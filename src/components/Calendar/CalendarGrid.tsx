'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  startOfMonth, endOfMonth, eachDayOfInterval,
  startOfWeek, endOfWeek, isSameMonth, isSameDay,
  isToday, format, addMonths, subMonths,
} from 'date-fns'
import { zhTW } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CalendarGridProps {
  bookedDates: Record<string, number>  // "YYYY-MM-DD" -> booking count
  onDayClick: (date: Date) => void
}

export default function CalendarGrid({ bookedDates, onDayClick }: CalendarGridProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const bookedSet = new Set(Object.keys(bookedDates))

  const monthStart = startOfMonth(currentMonth)
  const monthEnd   = endOfMonth(currentMonth)
  const gridStart  = startOfWeek(monthStart, { weekStartsOn: 1 }) // Mon start
  const gridEnd    = endOfWeek(monthEnd,   { weekStartsOn: 1 })
  const days       = eachDayOfInterval({ start: gridStart, end: gridEnd })

  const weekDays = ['一', '二', '三', '四', '五', '六', '日']

  const prevMonth = useCallback(() => setCurrentMonth(d => subMonths(d, 1)), [])
  const nextMonth = useCallback(() => setCurrentMonth(d => addMonths(d, 1)), [])
  const goToToday = useCallback(() => setCurrentMonth(new Date()), [])

  return (
    <div className="bg-surface rounded-card shadow-warm p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={prevMonth}
          className="p-2 rounded-input hover:bg-bg text-muted hover:text-primary transition-colors"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="text-center">
          <motion.h2
            key={format(currentMonth, 'yyyy-MM')}
            className="font-serif font-bold text-xl text-text-main"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {format(currentMonth, 'yyyy年 M月', { locale: zhTW })}
          </motion.h2>
          <button
            onClick={goToToday}
            className="text-xs text-muted hover:text-primary transition-colors mt-0.5"
          >
            今日
          </button>
        </div>

        <button
          onClick={nextMonth}
          className="p-2 rounded-input hover:bg-bg text-muted hover:text-primary transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-2">
        {weekDays.map((d) => (
          <div key={d} className="text-center text-xs font-semibold text-muted py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <motion.div
        key={format(currentMonth, 'yyyy-MM')}
        className="grid grid-cols-7 gap-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
      >
        {days.map((day) => {
          const dateStr  = format(day, 'yyyy-MM-dd')
          const inMonth  = isSameMonth(day, currentMonth)
          const isNow    = isToday(day)
          const count    = bookedDates[dateStr] ?? 0
          const hasEvent = count > 0

          return (
            <button
              key={dateStr}
              onClick={() => onDayClick(day)}
              className={cn(
                'relative flex flex-col items-center justify-start pt-1.5 pb-2 rounded-input min-h-[52px] transition-all duration-150 group',
                inMonth
                  ? 'hover:bg-primary/10 cursor-pointer'
                  : 'opacity-30 cursor-pointer',
                isNow && 'ring-2 ring-primary ring-offset-1',
              )}
            >
              <span
                className={cn(
                  'text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full transition-colors',
                  isNow
                    ? 'bg-primary text-white font-bold'
                    : inMonth
                      ? 'text-text-main group-hover:text-primary'
                      : 'text-muted',
                )}
              >
                {format(day, 'd')}
              </span>

              {/* Booking indicator */}
              {hasEvent && (
                <span className="mt-0.5 flex items-center gap-px">
                  {count === 1 ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                  ) : count === 2 ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                      <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                    </>
                  ) : (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                      <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                      <span className="w-1.5 h-1.5 rounded-full bg-gold/60" />
                    </>
                  )}
                </span>
              )}
            </button>
          )
        })}
      </motion.div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gold/20 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-primary inline-block" />
          今日
        </span>
        <span className="flex items-center gap-1.5">
          <span className="flex gap-px">
            <span className="w-1.5 h-1.5 rounded-full bg-gold inline-block" />
          </span>
          已有預訂
        </span>
        <span className="flex items-center gap-1.5">
          <span className="flex gap-px">
            <span className="w-1.5 h-1.5 rounded-full bg-gold inline-block" />
            <span className="w-1.5 h-1.5 rounded-full bg-gold inline-block" />
          </span>
          多於一個預訂
        </span>
      </div>
    </div>
  )
}
