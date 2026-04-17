'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  danger?: boolean
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = '確定',
  cancelLabel = '返回',
  onConfirm,
  onCancel,
  danger = false,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onCancel])

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
            onClick={onCancel}
          />

          {/* Dialog */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            onClick={onCancel}
          >
            <div className="bg-surface rounded-card shadow-warm-lg p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-start gap-3 mb-4">
                {danger && (
                  <div className="shrink-0 w-9 h-9 rounded-full bg-booked-bg flex items-center justify-center">
                    <AlertTriangle size={18} className="text-primary" />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-text-main text-base">{title}</p>
                  {message && <p className="text-sm text-muted mt-1">{message}</p>}
                </div>
              </div>

              <div className="flex gap-2 justify-end mt-6">
                <button
                  onClick={onCancel}
                  className="px-4 py-2 rounded-input text-sm font-medium text-muted bg-bg hover:bg-gold-light transition-colors duration-150"
                >
                  {cancelLabel}
                </button>
                <button
                  onClick={onConfirm}
                  className={cn(
                    'px-4 py-2 rounded-input text-sm font-medium text-white transition-all duration-150 active:scale-95',
                    danger
                      ? 'bg-primary hover:bg-primary-dark'
                      : 'bg-primary hover:bg-primary-dark'
                  )}
                >
                  {confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
