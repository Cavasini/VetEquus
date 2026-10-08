import { useState } from 'react'
import { CalendarPlus, Cloud, HeartPulse, MapPin, PawPrint, Plus, Stethoscope, Wifi, WifiOff } from 'lucide-react'
import { useVet } from '../../context/VetContext'
import NovoAgendamentoModal from '../agenda/NovoAgendamentoModal'
import NovoAnimalModal from '../animais/NovoAnimalModal'
import { Modal } from '../common/ui'

export default function Header() {
  const { db, harasFiltro, setHarasFiltro, setTab, novoRegistroOpen, setNovoRegistroOpen } = useVet()
  const [online, setOnline] = useState(true)
  const [modal, setModal] = useState<'ag' | 'animal' | null>(null)

  const go = (t: Parameters<typeof setTab>[0]) => { setTab(t); setNovoRegistroOpen(false) }

  return (
    <header className="no-print flex items-center justify-between border-b border-slate-200 bg-white px-8 py-3">
      <div className="flex items-center gap-2">
        <MapPin size={18} className="text-slate-400" />
        <select value={harasFiltro} onChange={(e) => setHarasFiltro(e.target.value)} className="input !w-64 !py-2 font-semibold">
          <option value="todos">Todos os Haras</option>
          {db.haras.map((h) => <option key={h.id} value={h.id}>{h.nome}</option>)}
        </select>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={() => setOnline(!online)}
          className={`flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${online ? 'border-emerald-300 bg-emerald-100 text-emerald-700' : 'border-slate-300 bg-slate-100 text-slate-600'}`}
          title="Alternar modo offline (simulação)"
        >
          {online ? <><Cloud size={14} /> Sincronizado <Wifi size={14} /></> : <><WifiOff size={14} /> Offline — alterações locais</>}
        </button>
        <button className="btn-primary" onClick={() => setNovoRegistroOpen(true)}>
          <Plus size={18} /> Novo Atendimento / Registro
        </button>
      </div>

      {novoRegistroOpen && (
        <Modal title="Novo Atendimento / Registro" onClose={() => setNovoRegistroOpen(false)}>
          <div className="grid grid-cols-2 gap-3">
            {[
              { l: 'Novo agendamento', i: CalendarPlus, f: () => { setNovoRegistroOpen(false); setModal('ag') } },
              { l: 'Cadastrar animal', i: PawPrint, f: () => { setNovoRegistroOpen(false); setModal('animal') } },
              { l: 'Consulta clínica', i: Stethoscope, f: () => go('clinica') },
              { l: 'Controle folicular / Match TE', i: HeartPulse, f: () => go('reproducao') },
            ].map(({ l, i: Icon, f }) => (
              <button key={l} onClick={f} className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-slate-200 p-5 text-sm font-semibold text-slate-700 hover:border-brand-500 hover:bg-brand-50">
                <Icon size={28} className="text-brand-500" /> {l}
              </button>
            ))}
          </div>
        </Modal>
      )}
      {modal === 'ag' && <NovoAgendamentoModal onClose={() => setModal(null)} />}
      {modal === 'animal' && <NovoAnimalModal onClose={() => setModal(null)} />}
    </header>
  )
}
