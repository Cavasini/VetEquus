import { useState } from 'react'
import { useVet } from '../../context/VetContext'
import type { Inducao } from '../../types/vet'
import { fmtBR, pad } from '../../utils/date'
import { Empty, Field } from '../common/ui'
import FolicularForm from './FolicularForm'

const nowLocal = () => {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function FolicularInducao() {
  const { db, animaisF, addInducao } = useVet()
  const eguas = animaisF.filter((a) => a.categoria === 'Doadora' || a.categoria === 'Receptora')
  const [animalId, setAnimalId] = useState(eguas[0]?.id ?? '')
  const [droga, setDroga] = useState<Inducao['droga']>('Deslorelina')
  const [ind, setInd] = useState(nowLocal())
  const [ovu, setOvu] = useState(nowLocal())

  const animalSel = eguas.find((e) => e.id === animalId) ? animalId : eguas[0]?.id ?? ''
  const horas = Math.round((new Date(ovu).getTime() - new Date(ind).getTime()) / 36e5)
  const valido = Number.isFinite(horas) && horas > 0
  const hist = db.inducoes.filter((i) => i.animalId === animalSel).sort((a, b) => a.inducaoEm.localeCompare(b.inducaoEm))
  const media = hist.length ? hist.reduce((s, i) => s + i.horas, 0) / hist.length : 0
  const maxH = Math.max(60, ...hist.map((h) => h.horas), valido ? horas : 0)

  if (!eguas.length) return <Empty text="Sem éguas no haras selecionado." />

  return (
    <div className="space-y-5">
      <div className="card flex items-center gap-3 p-4">
        <Field label="Égua"><select className="input sm:!w-72" value={animalSel} onChange={(e) => setAnimalId(e.target.value)}>
          {eguas.map((e) => <option key={e.id} value={e.id}>{e.nome} ({e.categoria})</option>)}
        </select></Field>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card p-5">
          <h3 className="mb-4 font-bold text-slate-800">Exame folicular</h3>
          <FolicularForm key={animalSel} animalId={animalSel} />
          <div className="mt-5 space-y-1.5 border-t border-slate-100 pt-4">
            <h4 className="text-sm font-bold text-slate-600">Últimos exames</h4>
            {db.foliculares.filter((f) => f.animalId === animalSel).slice(-4).reverse().map((f) => (
              <div key={f.id} className="rounded-lg bg-slate-50 px-3 py-1.5 text-xs">{fmtBR(f.data)} · OD {f.ovD} / OE {f.ovE} mm · edema {f.edema} · {f.tonus} · CL {f.cl}</div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="mb-4 font-bold text-slate-800">Calculadora de indução</h3>
          <div className="space-y-3">
            <Field label="Indutor">
              <div className="flex gap-2">
                {(['Deslorelina', 'hCG'] as const).map((d) => (
                  <button key={d} onClick={() => setDroga(d)} className={`flex-1 cursor-pointer rounded-lg border-2 py-2 text-sm font-bold ${droga === d ? 'border-brand-500 bg-brand-50 text-brand-600' : 'border-slate-200 text-slate-500'}`}>{d}</button>
                ))}
              </div>
            </Field>
            <Field label="Data/hora da indução"><input type="datetime-local" className="input" value={ind} onChange={(e) => setInd(e.target.value)} /></Field>
            <Field label="Data/hora da ovulação constatada"><input type="datetime-local" className="input" value={ovu} onChange={(e) => setOvu(e.target.value)} /></Field>
            <div className="rounded-xl bg-brand-50 p-4 text-center">
              <div className="text-xs font-semibold uppercase text-brand-600">Tempo de resposta</div>
              <div className="text-4xl font-extrabold text-brand-600">{valido ? horas : '--'} <span className="text-lg">h</span></div>
            </div>
            <button className="btn-primary w-full" disabled={!valido || !animalSel} onClick={() => addInducao({ animalId: animalSel, droga, inducaoEm: ind, ovulacaoEm: ovu, horas })}>Salvar no histórico da égua</button>
          </div>

          <h4 className="mb-2 mt-6 text-sm font-bold text-slate-600">Padrão histórico {media > 0 && <span className="font-normal text-slate-400">· média {media.toFixed(1)} h</span>}</h4>
          {hist.length === 0 ? <Empty text="Sem histórico de indução para esta égua." /> : (
            <div className="flex h-36 items-end gap-3 rounded-xl border border-slate-200 p-3">
              {hist.map((h) => (
                <div key={h.id} className="flex flex-1 flex-col items-center gap-1" title={`${h.droga} · ${fmtBR(h.inducaoEm)}`}>
                  <span className="text-xs font-bold text-slate-700">{h.horas}h</span>
                  <div className={`w-full rounded-t-md ${h.droga === 'hCG' ? 'bg-amber-400' : 'bg-purple-400'}`} style={{ height: `${(h.horas / maxH) * 80}px` }} />
                  <span className="text-[10px] text-slate-400">{fmtBR(h.inducaoEm).slice(0, 5)}</span>
                </div>
              ))}
            </div>
          )}
          <div className="mt-2 flex gap-4 text-xs text-slate-500"><span><span className="mr-1 inline-block h-2 w-2 rounded bg-purple-400" />Deslorelina</span><span><span className="mr-1 inline-block h-2 w-2 rounded bg-amber-400" />hCG</span></div>
        </div>
      </div>
    </div>
  )
}
