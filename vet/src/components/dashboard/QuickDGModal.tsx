import { CheckCircle2, HelpCircle, XCircle } from 'lucide-react'
import { useVet, type DGResultado } from '../../context/VetContext'
import type { Agendamento } from '../../types/vet'
import { Modal } from '../common/ui'

export default function QuickDGModal({ ag, onClose }: { ag: Agendamento; onClose: () => void }) {
  const { registrarDG, animalNome, harasNome } = useVet()
  const act = (r: DGResultado) => { registrarDG(ag, r); onClose() }
  const opts: { r: DGResultado; label: string; icon: typeof XCircle; cls: string }[] = [
    { r: 'Positivo', label: 'Positivo', icon: CheckCircle2, cls: 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100' },
    { r: 'Negativo', label: 'Negativo', icon: XCircle, cls: 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100' },
    { r: 'Reavaliar', label: 'Reavaliar', icon: HelpCircle, cls: 'border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100' },
  ]
  return (
    <Modal title={`Diagnóstico de Gestação — ${ag.subtipo}`} onClose={onClose}>
      <p className="mb-5 text-sm text-slate-600"><b>{animalNome(ag.animalId)}</b> · {harasNome(ag.harasId)}<br />{ag.obs}</p>
      <div className="grid grid-cols-3 gap-3">
        {opts.map(({ r, label, icon: Icon, cls }) => (
          <button key={r} onClick={() => act(r)} className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 py-6 text-base font-bold ${cls}`}>
            <Icon size={34} /> {label}
          </button>
        ))}
      </div>
    </Modal>
  )
}
