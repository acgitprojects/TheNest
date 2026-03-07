'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import { SITE_NAME } from '@/lib/constants'

const floatingOrbs = [
  { size: 320, x: '-10%', y: '-15%', delay: 0, duration: 8 },
  { size: 200, x: '75%',  y: '60%',  delay: 1, duration: 10 },
  { size: 160, x: '85%',  y: '-5%',  delay: 2, duration: 7  },
  { size: 120, x: '20%',  y: '75%',  delay: 0.5, duration: 9 },
]

const taglines = [
  '聚在一起，每一刻都值得記住',
  '您的專屬聚腳點，由今日開始',
  '不只是一個地方，是大家的小天地',
]

export default function LandingPage() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-bg">

      {/* Animated background orbs */}
      {floatingOrbs.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.x,
            top: orb.y,
            background:
              i % 2 === 0
                ? 'radial-gradient(circle, rgba(232,112,74,0.18) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(201,169,97,0.15) 0%, transparent 70%)',
          }}
          animate={{ y: [0, -20, 0], scale: [1, 1.04, 1] }}
          transition={{
            duration: orb.duration,
            delay: orb.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Decorative nest icon */}
      <motion.div
        className="absolute right-8 top-8 text-gold/30 hidden md:block"
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span className="text-8xl select-none">🪺</span>
      </motion.div>

      {/* Hero content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-3xl mx-auto">

        {/* Badge */}
        <motion.div
          className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/20 border border-gold/30 text-sm font-medium text-gold mb-8"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Sparkles size={14} />
          <span>旺角派對室 · 全日24小時</span>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          className="font-serif font-bold text-5xl sm:text-6xl md:text-7xl text-text-main leading-tight mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          歡迎回家
        </motion.h1>

        <motion.h2
          className="font-serif font-bold text-4xl sm:text-5xl md:text-6xl text-gradient-warm leading-tight mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          這裡是 {SITE_NAME} 🪺
        </motion.h2>

        {/* Taglines */}
        <motion.div
          className="flex flex-col gap-2 mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {taglines.map((line, i) => (
            <motion.p
              key={i}
              className="text-muted text-base sm:text-lg"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
            >
              {line}
            </motion.p>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.7, type: 'spring', stiffness: 200 }}
        >
          <Link
            href="/login"
            className="group inline-flex items-center gap-3 bg-primary hover:bg-primary-dark text-white font-semibold text-lg px-8 py-4 rounded-card shadow-warm-md hover:shadow-warm-lg transition-all duration-200 active:scale-95"
          >
            立即預訂
            <motion.span
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ArrowRight size={20} />
            </motion.span>
          </Link>
        </motion.div>

        {/* Subtle bottom note */}
        <motion.p
          className="mt-10 text-xs text-muted/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          旺角新填地街576號新輝商業中心3樓A室
        </motion.p>
      </div>

      {/* Bottom warm gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-bg to-transparent pointer-events-none" />
    </main>
  )
}
