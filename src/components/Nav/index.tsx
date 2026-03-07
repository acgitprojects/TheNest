'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CalendarDays, BookOpen, Users, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SITE_NAME } from '@/lib/constants'
import toast from 'react-hot-toast'

export default function Nav() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
    router.refresh()
  }

  const links = [
    { href: '/calendar', label: '預訂日曆', icon: CalendarDays },
    { href: '/logbook',  label: '預訂記錄', icon: BookOpen },
    { href: '/hosts',    label: '主持人',   icon: Users },
  ]

  return (
    <nav className="sticky top-0 z-50 glass border-b border-gold/20 shadow-warm">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/calendar" className="font-serif font-bold text-lg text-primary tracking-wide">
          {SITE_NAME}
        </Link>

        {/* Links + Logout */}
        <div className="flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-input text-sm font-medium transition-all duration-150',
                pathname === href
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted hover:text-text-main hover:bg-primary/10'
              )}
            >
              <Icon size={15} />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}

          <button
            onClick={() => {
              toast.promise(handleLogout(), {
                loading: '登出中...',
                success: '已登出',
                error: '登出失敗',
              })
            }}
            className="flex items-center gap-1.5 ml-2 px-3 py-1.5 rounded-input text-sm font-medium text-muted hover:text-primary hover:bg-primary/10 transition-all duration-150"
          >
            <LogOut size={15} />
            <span className="hidden sm:inline">登出</span>
          </button>
        </div>
      </div>
    </nav>
  )
}
