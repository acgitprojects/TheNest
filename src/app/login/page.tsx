'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { SITE_NAME } from '@/lib/constants'

export default function LoginPage() {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPin, setShowPin] = useState(false)
  const [shake, setShake] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!pin || loading) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      })

      if (res.ok) {
        router.push('/calendar')
        router.refresh()
      } else {
        const data = await res.json() as { error?: string }
        setError(data.error ?? '密碼錯誤，請再試')
        setPin('')
        setShake(true)
        setTimeout(() => setShake(false), 600)
        inputRef.current?.focus()
      }
    } catch {
      setError('連線錯誤，請重試')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-bg flex items-center justify-center px-4">
      {/* Background orb */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 30%, rgba(232,112,74,0.10) 0%, transparent 70%)',
        }}
      />

      <div className="relative w-full max-w-sm">
        {/* Back link */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft size={15} />
            返回
          </Link>
        </motion.div>

        {/* Card */}
        <motion.div
          className="bg-surface rounded-card shadow-warm-lg p-8"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 200, damping: 24 }}
        >
          {/* Icon */}
          <motion.div
            className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Lock size={28} className="text-primary" />
          </motion.div>

          <h1 className="font-serif font-bold text-2xl text-center text-text-main mb-1">
            {SITE_NAME}
          </h1>
          <p className="text-center text-muted text-sm mb-8">請輸入密碼進入</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* PIN input */}
            <motion.div
              animate={shake ? { x: [-6, 6, -5, 5, -3, 3, 0] } : { x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="relative">
                <input
                  ref={inputRef}
                  type={showPin ? 'text' : 'password'}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={8}
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value.replace(/\D/g, ''))
                    setError('')
                  }}
                  placeholder="輸入密碼"
                  autoFocus
                  className="w-full bg-bg border-2 border-gold/30 focus:border-primary outline-none rounded-input px-4 py-3 text-center text-xl font-semibold tracking-widest text-text-main placeholder:text-muted/40 placeholder:text-base placeholder:tracking-normal transition-colors duration-150"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors"
                  tabIndex={-1}
                >
                  {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </motion.div>

            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.p
                  className="text-sm text-primary text-center"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Submit */}
            <button
              type="submit"
              disabled={!pin || loading}
              className="w-full bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-input transition-all duration-150 active:scale-95 mt-2"
            >
              {loading ? '驗證中⋯' : '進入'}
            </button>
          </form>
        </motion.div>
      </div>
    </main>
  )
}
