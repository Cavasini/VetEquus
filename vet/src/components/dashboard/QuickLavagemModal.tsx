import { useState } from 'react'
import { useVet } from '../../context/VetContext'
import type { Agendamento, Embriao } from '../../types/vet'
import { Field, Modal } from '../common/ui'

export default function QuickLavagemModal({ ag, onClose }: { ag: Agendamento; onClose: () => void }) {
  const { db, registrarLavagem, animalNome, setTab } = useVet()
  const [positiva, setPositiva] = useState(true)
  const [n, setN] = useState(1)
  const [grau, setGrau] = useState<Embriao['grau']>('I')
  const [garanhao, setGaranhao] = useState(db.animais.find((a) => a.categoria === 'Garanhão' && a.harasId === ag.harasId)?.nome ?? '')

  const salvar = (vincular: boolean) => {
    registrarLavagem(ag, { positiva, embrioes: positiva ? n : 0, grau, garanhao })
    onClose()
    if (vincular && positiva) setTab('reproducao')
  }

  return (
    <Modal
      title={`Resultado da Lavagem — ${animalNome(ag.animalId)}`}
      onClose={onClose}
      footer={
        <>
          <button className="btn-secondary" onClick={() => salvar(false)}>Salvar</button>
          {positiva && <button className="btn-primary" onClick={() => salvar(true)}>Salvar e vincular receptora</button>}
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {[true, false].map((v) => (
            <button key={String(v)} onClick={() => setPositiva(v)} className={`cursor-pointer rounded-xl border-2 py-4 font-bold ${positiva === v ? (v ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-red-400 bg-red-50 text-red-700') : 'border-slate-200 text-slate-400'}`}>
              {v ? 'Positiva' : 'Negativa'}
            </button>
          ))}
        </div>
        {positiva && (
          <>
            <Field label="Número de embriões">
              <div className="flex items-center gap-3">
                <button className="btn-secondary !px-4" onClick={() => setN(Math.max(1, n - 1))}>−</button>
                <span className="w-10 text-center text-2xl font-extrabold">{n}</span>
                <button className="btn-secondary !px-4" onClick={() => setN(n + 1)}>+</button>
              </div>
            </Field>
            <Field label="Qualidade">
              <div className="grid grid-cols-3 gap-2">
                {(['I', 'II', 'III'] as const).map((g) => (
                  <button key={g} onClick={() => setGrau(g)} className={`cursor-pointer rounded-lg border-2 py-2.5 font-bold ${grau === g ? 'border-brand-500 bg-brand-50 text-brand-600' : 'border-slate-200 text-slate-500'}`}>Grau {g}</button>
                ))}
              </div>
            </Field>
            <Field label="Garanhão (pai do embrião)">
              <input className="input" value={garanhao} onChange={(e) => setGaranhao(e.target.value)} />
            </Field>
          </>
        )}
      </div>
    </Modal>
  )
}
