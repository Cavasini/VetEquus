import { useState } from 'react'
import { useVet } from '../../context/VetContext'
import type { Folicular } from '../../types/vet'
import { todayISO } from '../../utils/date'
import { Field } from '../common/ui'

const EDEMA_LABEL = ['0 · Ausente', '1 · Leve', '2 · Moderado', '3 · Intenso', '4 · Máximo']
const EDEMA_COLOR = ['bg-slate-100 text-slate-600', 'bg-sky-100 text-sky-700', 'bg-emerald-100 text-emerald-700', 'bg-amber-100 text-amber-800', 'bg-red-100 text-red-700']

export function DiametroPicker({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-bold text-slate-700">{label}</span>
        <span className="text-2xl font-extrabold text-brand-600">{value} <span className="text-sm font-semibold text-slate-400">mm</span></span>
      </div>
      <div className="mb-3 flex gap-1.5">
        {[25, 30, 35, 40, 45].map((v) => (
          <button key={v} type="button" onClick={() => onChange(v)} className={`flex-1 cursor-pointer rounded-lg border py-2 text-sm font-bold ${value === v ? 'border-brand-500 bg-brand-500 text-white' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}`}>{v}</button>
        ))}
      </div>
      <input type="range" min={5} max={60} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-blue-600" />
    </div>
  )
}

export default function FolicularForm({ animalId, agId, onSaved }: { animalId: string; agId?: string; onSaved?: () => void }) {
  const { registrarFolicular } = useVet()
  const [ovD, setOvD] = useState(30)
  const [ovE, setOvE] = useState(25)
  const [edema, setEdema] = useState(2)
  const [tonus, setTonus] = useState<Folicular['tonus']>('Médio')
  const [cl, setCl] = useState<Folicular['cl']>('Ausente')
  const [ovulou, setOvulou] = useState(false)
  const [obs, setObs] = useState('')

  const salvar = () => {
    registrarFolicular({ animalId, data: todayISO(), ovD, ovE, edema, tonus, cl, obs }, agId, ovulou)
    onSaved?.()
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <DiametroPicker label="Ovário Direito" value={ovD} onChange={setOvD} />
        <DiametroPicker label="Ovário Esquerdo" value={ovE} onChange={setOvE} />
      </div>
      <Field label="Edema uterino (0 a 4)">
        <div className="grid grid-cols-5 gap-1.5">
          {EDEMA_LABEL.map((l, i) => (
            <button key={l} type="button" onClick={() => setEdema(i)} className={`cursor-pointer rounded-lg border-2 px-1 py-2 text-xs font-bold ${EDEMA_COLOR[i]} ${edema === i ? 'border-slate-800' : 'border-transparent'}`}>{l}</button>
          ))}
        </div>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Tônus uterino">
          <div className="flex gap-1.5">
            {(['Flácido', 'Médio', 'Tônico'] as const).map((t) => (
              <button key={t} type="button" onClick={() => setTonus(t)} className={`flex-1 cursor-pointer rounded-lg border py-2 text-sm font-semibold ${tonus === t ? 'border-brand-500 bg-brand-50 text-brand-600' : 'border-slate-300 text-slate-600'}`}>{t}</button>
            ))}
          </div>
        </Field>
        <Field label="Corpo lúteo">
          <div className="flex gap-1.5">
            {(['Ausente', 'Cavitário', 'Compacto'] as const).map((t) => (
              <button key={t} type="button" onClick={() => setCl(t)} className={`flex-1 cursor-pointer rounded-lg border py-2 text-sm font-semibold ${cl === t ? 'border-brand-500 bg-brand-50 text-brand-600' : 'border-slate-300 text-slate-600'}`}>{t}</button>
            ))}
          </div>
        </Field>
      </div>
      <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-700">
        <input type="checkbox" checked={ovulou} onChange={(e) => setOvulou(e.target.checked)} className="h-4 w-4" /> Ovulação constatada neste exame
      </label>
      <Field label="Observações"><input className="input" value={obs} onChange={(e) => setObs(e.target.value)} /></Field>
      <button className="btn-primary w-full" onClick={salvar}>Salvar controle folicular</button>
    </div>
  )
}
