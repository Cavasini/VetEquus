import { useState } from 'react'
import { Camera, FileText, Image as ImageIcon, Scale, ShieldCheck, Stethoscope } from 'lucide-react'
import { useVet } from '../../context/VetContext'
import { fmtBR, todayISO } from '../../utils/date'
import { Empty, Field, Tag } from '../common/ui'
import BiometriaChart from './BiometriaChart'
import VacinasTable from './VacinasTable'

const SUBS = [
  { id: 'consultas', label: 'Consultas', icon: Stethoscope },
  { id: 'preventiva', label: 'Medicina Preventiva', icon: ShieldCheck },
  { id: 'midia', label: 'Galeria / Exames', icon: ImageIcon },
  { id: 'biometria', label: 'Biometria', icon: Scale },
] as const

const MIDIA_COR = { Ultrassom: 'from-slate-700 to-slate-900', Ferida: 'from-rose-300 to-rose-500', Exame: 'from-sky-300 to-sky-500' }

export default function ClinicaTab() {
  const { db, animaisF, addConsulta, animalNome } = useVet()
  const [sub, setSub] = useState<(typeof SUBS)[number]['id']>('consultas')
  const [animalId, setAnimalId] = useState('')
  const sel = animaisF.find((a) => a.id === animalId)?.id ?? animaisF[0]?.id ?? ''

  const vazio = { temperatura: 38, fc: 40, fr: 16, tpc: 2, motilidade: 'Normal', queixa: '', diagnostico: '', prescricao: '' }
  const [f, setF] = useState(vazio)
  const set = <K extends keyof typeof vazio>(k: K, v: (typeof vazio)[K]) => setF((s) => ({ ...s, [k]: v }))

  const consultas = db.consultas.filter((c) => c.animalId === sel)
  const midias = db.midias.filter((m) => animaisF.some((a) => a.id === m.animalId))

  const salvar = () => {
    addConsulta({ ...f, animalId: sel, data: todayISO() })
    setF(vazio)
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold text-slate-800">Prontuário Clínico e Preventivo</h1>
      <div className="flex w-fit gap-1 rounded-lg bg-slate-100 p-1">
        {SUBS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setSub(id)} className={`flex cursor-pointer items-center gap-2 rounded-md px-5 py-2 text-sm font-semibold ${sub === id ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500'}`}><Icon size={16} /> {label}</button>
        ))}
      </div>

      {(sub === 'consultas' || sub === 'biometria') && (
        <div className="card flex items-center gap-3 p-3">
          <div className="w-80"><Field label="Animal">
            <select className="input" value={sel} onChange={(e) => setAnimalId(e.target.value)}>
              {animaisF.map((a) => <option key={a.id} value={a.id}>{a.nome} ({a.categoria})</option>)}
            </select>
          </Field></div>
        </div>
      )}

      {sub === 'consultas' && (
        <div className="grid grid-cols-2 gap-5">
          <div className="card space-y-4 p-5">
            <h3 className="font-bold text-slate-800">Novo atendimento</h3>
            <div className="grid grid-cols-5 gap-2">
              <Field label="Temp °C"><input type="number" step="0.1" className="input" value={f.temperatura} onChange={(e) => set('temperatura', Number(e.target.value))} /></Field>
              <Field label="FC bpm"><input type="number" className="input" value={f.fc} onChange={(e) => set('fc', Number(e.target.value))} /></Field>
              <Field label="FR mpm"><input type="number" className="input" value={f.fr} onChange={(e) => set('fr', Number(e.target.value))} /></Field>
              <Field label="TPC s"><input type="number" className="input" value={f.tpc} onChange={(e) => set('tpc', Number(e.target.value))} /></Field>
              <Field label="Motilid."><select className="input" value={f.motilidade} onChange={(e) => set('motilidade', e.target.value)}><option>Normal</option><option>Diminuída</option><option>Ausente</option><option>Aumentada</option></select></Field>
            </div>
            <Field label="Queixa"><input className="input" value={f.queixa} onChange={(e) => set('queixa', e.target.value)} /></Field>
            <Field label="Diagnóstico"><input className="input" value={f.diagnostico} onChange={(e) => set('diagnostico', e.target.value)} /></Field>
            <Field label="Prescrição de medicamentos"><textarea rows={3} className="input" placeholder="Ex.: Lutalyse 5 mg IM dose única" value={f.prescricao} onChange={(e) => set('prescricao', e.target.value)} /></Field>
            <button className="btn-primary w-full" disabled={!sel || !f.queixa.trim()} onClick={salvar}>Registrar consulta</button>
          </div>
          <div className="card p-5">
            <h3 className="mb-3 font-bold text-slate-800">Histórico de {animalNome(sel)}</h3>
            {consultas.length === 0 ? <Empty text="Nenhuma consulta registrada." /> : (
              <div className="space-y-3">
                {consultas.map((c) => (
                  <div key={c.id} className="rounded-xl border border-slate-200 p-3 text-sm">
                    <div className="mb-1 flex items-center justify-between font-bold"><span>{fmtBR(c.data)}</span><Tag color={c.temperatura > 38.5 ? 'red' : 'green'}>{c.temperatura} °C</Tag></div>
                    <div className="mb-1 text-xs text-slate-500">FC {c.fc} · FR {c.fr} · TPC {c.tpc}s · Motilidade {c.motilidade}</div>
                    <div><b>Queixa:</b> {c.queixa}</div><div><b>Dx:</b> {c.diagnostico || '-'}</div><div><b>Rx:</b> {c.prescricao || '-'}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {sub === 'preventiva' && <VacinasTable />}

      {sub === 'midia' && (
        midias.length === 0 ? <Empty text="Sem mídias." /> : (
          <div className="grid grid-cols-4 gap-4">
            {midias.map((m) => (
              <div key={m.id} className="card overflow-hidden">
                <div className={`flex h-36 items-center justify-center bg-gradient-to-br text-white/80 ${MIDIA_COR[m.tipo]}`}>{m.tipo === 'Exame' ? <FileText size={40} /> : <Camera size={40} />}</div>
                <div className="p-3"><div className="text-sm font-semibold">{m.titulo}</div><div className="text-xs text-slate-500">{animalNome(m.animalId)} · {fmtBR(m.data)}</div><div className="mt-1"><Tag color={m.tipo === 'Ferida' ? 'red' : 'blue'}>{m.tipo}</Tag></div></div>
              </div>
            ))}
          </div>
        )
      )}

      {sub === 'biometria' && <div className="card p-5"><BiometriaChart animalId={sel} /></div>}
    </div>
  )
}
