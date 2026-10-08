import { CalendarDays, FileText, HeartPulse, LayoutDashboard, PawPrint, Stethoscope } from 'lucide-react'
import { useVet } from '../../context/VetContext'
import type { TabId } from '../../types/vet'

const ITEMS: { id: TabId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'inicio', label: 'Início', icon: LayoutDashboard },
  { id: 'agenda', label: 'Agenda', icon: CalendarDays },
  { id: 'animais', label: 'Clientes e Animais', icon: PawPrint },
  { id: 'reproducao', label: 'Reprodução', icon: HeartPulse },
  { id: 'clinica', label: 'Clínico e Preventivo', icon: Stethoscope },
  { id: 'financeiro', label: 'Administrativo', icon: FileText },
]

export default function Sidebar() {
  const { tab, setTab, resetDemo } = useVet()
  return (
    <aside className="no-print flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center gap-3 px-6 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-xl text-white">🐴</div>
        <div>
          <div className="text-lg font-extrabold leading-tight text-slate-800">VetEquus</div>
          <div className="text-xs text-slate-400">Gestão clínica equina</div>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-2">
        {ITEMS.map(({ id, label, icon: Icon }) => {
          const active = tab === id
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`relative flex w-full cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold transition ${active ? 'bg-brand-50 text-brand-600' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              {active && <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-brand-500" />}
              <Icon size={20} />
              {label}
            </button>
          )
        })}
      </nav>
      <div className="border-t border-slate-200 p-4">
        <button onClick={() => { if (confirm('Restaurar os dados iniciais da demo?')) resetDemo() }} className="w-full cursor-pointer text-xs text-slate-400 hover:text-slate-700">
          Restaurar dados da demo
        </button>
      </div>
    </aside>
  )
}
