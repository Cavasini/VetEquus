import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import type { Categoria } from '../../types/vet'

export const CAT_STYLE: Record<Categoria, { badge: string; solid: string; dot: string }> = {
  Doadora: { badge: 'bg-purple-100 text-purple-700 border-purple-300', solid: 'bg-purple-500', dot: 'bg-purple-400' },
  Receptora: { badge: 'bg-emerald-100 text-emerald-700 border-emerald-300', solid: 'bg-emerald-500', dot: 'bg-emerald-400' },
  Garanhão: { badge: 'bg-amber-100 text-amber-800 border-amber-300', solid: 'bg-amber-500', dot: 'bg-amber-400' },
  Potro: { badge: 'bg-sky-100 text-sky-700 border-sky-300', solid: 'bg-sky-500', dot: 'bg-sky-400' },
}

export function CatBadge({ cat }: { cat: Categoria }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${CAT_STYLE[cat].badge}`}>
      {cat}
    </span>
  )
}

export function Tag({ children, color = 'slate' }: { children: ReactNode; color?: 'slate' | 'green' | 'red' | 'blue' | 'amber' | 'purple' | 'sky' }) {
  const map = {
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    green: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    red: 'bg-red-100 text-red-700 border-red-300',
    blue: 'bg-blue-100 text-blue-700 border-blue-300',
    amber: 'bg-amber-100 text-amber-800 border-amber-300',
    purple: 'bg-purple-100 text-purple-700 border-purple-300',
    sky: 'bg-sky-100 text-sky-700 border-sky-300',
  }
  return <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${map[color]}`}>{children}</span>
}

export function Modal({ title, onClose, children, wide, footer }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean; footer?: ReactNode }) {
  return (
    <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`flex max-h-[92vh] w-full flex-col rounded-2xl bg-white shadow-2xl ${wide ? 'max-w-4xl' : 'max-w-lg'}`}>
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-800">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"><X size={20} /></button>
        </div>
        <div className="overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-slate-200 px-6 py-4">{footer}</div>}
      </div>
    </div>
  )
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  )
}

export function Empty({ text }: { text: string }) {
  return <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-400">{text}</div>
}
