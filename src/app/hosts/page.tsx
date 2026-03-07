'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Nav from '@/components/Nav'
import ConfirmDialog from '@/components/ConfirmDialog'
import type { Host } from '@/types'

export default function HostsPage() {
  const [hosts, setHosts]               = useState<Host[]>([])
  const [loading, setLoading]           = useState(true)
  const [name, setName]                 = useState('')
  const [saving, setSaving]             = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Host | null>(null)
  const [deleting, setDeleting]         = useState(false)
  const inputRef                        = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/hosts')
      .then((r) => r.json())
      .then(({ data }: { data: Host[] }) => setHosts(data))
      .finally(() => setLoading(false))
  }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return

    setSaving(true)
    try {
      const res = await fetch('/api/hosts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed }),
      })
      const json = await res.json() as { data?: Host; error?: string }
      if (!res.ok) throw new Error(json.error ?? '新增失敗')
      setHosts((prev) => [...prev, json.data!])
      setName('')
      inputRef.current?.focus()
      toast.success('主持人已新增')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : '新增失敗')
    } finally {
      setSaving(false)
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/hosts/${deleteTarget.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const { error } = await res.json() as { error: string }
        throw new Error(error)
      }
      setHosts((prev) => prev.filter((h) => h.id !== deleteTarget.id))
      toast.success('主持人已刪除')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : '刪除失敗')
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  return (
    <>
      <Nav />
      <main className="max-w-xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Users size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="font-serif font-bold text-2xl text-text-main">主持人管理</h1>
            <p className="text-sm text-muted">新增或移除主持人</p>
          </div>
        </div>

        {/* Add form */}
        <form onSubmit={handleAdd} className="flex gap-2 mb-6">
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="輸入主持人姓名"
            className="flex-1 px-3 py-2 rounded-input border border-gold/30 bg-surface text-text-main placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
          />
          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-input bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus size={16} />
            新增
          </button>
        </form>

        {/* Host list */}
        {loading ? (
          <p className="text-sm text-muted text-center py-10">載入中…</p>
        ) : hosts.length === 0 ? (
          <p className="text-sm text-muted text-center py-10">尚無主持人</p>
        ) : (
          <ul className="space-y-2">
            <AnimatePresence initial={false}>
              {hosts.map((host) => (
                <motion.li
                  key={host.id}
                  layout
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.18 }}
                  className="flex items-center justify-between bg-surface border border-gold/20 rounded-card px-4 py-3 shadow-sm"
                >
                  <span className="text-sm font-medium text-text-main">{host.name}</span>
                  <button
                    onClick={() => setDeleteTarget(host)}
                    className="p-1.5 rounded-full text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                    aria-label={`刪除 ${host.name}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </main>

      <ConfirmDialog
        open={!!deleteTarget}
        danger
        title={`刪除「${deleteTarget?.name ?? ''}」？`}
        message="此操作無法復原。若該主持人仍有關聯預訂，將無法刪除。"
        confirmLabel={deleting ? '刪除中…' : '確定刪除'}
        cancelLabel="取消"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  )
}
