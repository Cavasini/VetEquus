import { useState } from 'react'
import { ArrowRight, CheckCircle2, Dna } from 'lucide-react'
import { useVet } from '../../context/VetContext'
import type { Animal } from '../../types/vet'
import { fmtBR } from '../../utils/date'
import { CatBadge, Empty, Tag } from '../common/ui'

const sincronia = (r: Animal) => {
  const dia = r.diaPosOv ?? -1
  const ideal = (dia === 5 || dia === 6) && (r.edema ?? 9) <= 1 && !!r.clAtivo
  const aceitavel = dia >= 4 && dia <= 7 && !!r.clAtivo
  return ideal ? 'ideal' : aceitavel ? 'aceitavel' : 'inadequada'
}

export default function MatchPanel() {
  const { db, animaisF, realizarMatch, harasNome } = useVet()
  const [embId, setEmbId] = useState<string | null>(null)
  const [recId, setRecId] = useState<string | null>(null)

  const doadoras = animaisF.filter((a) => a.categoria === 'Doadora')
  const embDisp = db.embrioes.filter((e) => !e.receptoraId)
  const emb = embDisp.find((e) => e.id === embId)
  const doadoraSel = emb ? db.animais.find((a) => a.id === emb.doadoraId) : undefined

  const receptoras = animaisF
    .filter((a) => a.categoria === 'Receptora' && a.status !== 'Prenha')
    .map((r) => ({ r, s: sincronia(r) }))
    .sort((a, b) => ['ideal', 'aceitavel', 'inadequada'].indexOf(a.s) - ['ideal', 'aceitavel', 'inadequada'].indexOf(b.s))

  const match = () => {
    if (!embId || !recId) return
    realizarMatch(embId, recId)
    setEmbId(null); setRecId(null)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card p-4">
          <h3 className="mb-3 font-bold text-purple-700">Doadoras · embriões disponíveis</h3>
          <div className="space-y-3">
            {doadoras.length === 0 && <Empty text="Sem doadoras." />}
            {doadoras.map((d) => {
              const embs = embDisp.filter((e) => e.doadoraId === d.id)
              return (
                <div key={d.id} className="rounded-xl border border-purple-200 bg-purple-50/40 p-3">
                  <div className="mb-1.5 flex items-center justify-between">
                    <div className="font-bold text-slate-800">{d.nome} <span className="text-xs font-normal text-slate-500">· {harasNome(d.harasId)}</span></div>
                    <div className="flex gap-1.5">
                      <CatBadge cat="Doadora" />
                      {d.diaPosOv != null && <Tag color="blue">D{d.diaPosOv}</Tag>}
                    </div>
                  </div>
                  {embs.length === 0 ? (
                    <div className="text-xs text-slate-400">
                      {d.diaPosOv != null && d.diaPosOv >= 7 && d.diaPosOv <= 9 ? 'Janela de lavagem (D7–D9) — registre o resultado em “Meu Dia”.' : 'Sem embriões disponíveis.'}
                    </div>
                  ) : embs.map((e) => (
                    <button key={e.id} onClick={() => { setEmbId(e.id); setRecId(null) }} className={`mt-1 flex w-full cursor-pointer items-center justify-between rounded-lg border-2 bg-white px-3 py-2 text-left text-sm ${embId === e.id ? 'border-purple-500' : 'border-slate-200'}`}>
                      <span className="flex items-center gap-2"><Dna size={16} className="text-purple-500" /> Embrião grau {e.grau} · {e.garanhaoNome}</span>
                      <span className="text-xs text-slate-400">lavagem {fmtBR(e.data)}</span>
                    </button>
                  ))}
                </div>
              )
            })}
          </div>
        </div>

        <div className="card p-4">
          <h3 className="mb-3 font-bold text-emerald-700">Receptoras · sincronia</h3>
          <div className="space-y-2">
            {receptoras.length === 0 && <Empty text="Sem receptoras disponíveis." />}
            {receptoras.map(({ r, s }) => {
              const bloqueada = doadoraSel && doadoraSel.harasId !== r.harasId
              return (
                <button
                  key={r.id}
                  disabled={!emb || !!bloqueada}
                  onClick={() => setRecId(r.id)}
                  className={`flex w-full cursor-pointer items-center justify-between rounded-xl border-2 p-3 text-left disabled:cursor-not-allowed disabled:opacity-40 ${recId === r.id ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-white'}`}
                >
                  <div>
                    <div className="font-bold text-slate-800">{r.nome} <span className="text-xs font-normal text-slate-500">· {harasNome(r.harasId)}</span></div>
                    <div className="mt-1 flex flex-wrap gap-1.5 text-xs">
                      <Tag color="sky">{r.diaPosOv != null ? `D${r.diaPosOv}` : 'Sem ciclo'}</Tag>
                      <Tag color="slate">Edema {r.edema ?? '-'}</Tag>
                      <Tag color={r.clAtivo ? 'green' : 'red'}>CL {r.clAtivo ? 'ativo' : 'ausente'}</Tag>
                    </div>
                  </div>
                  <Tag color={s === 'ideal' ? 'green' : s === 'aceitavel' ? 'amber' : 'red'}>
                    {s === 'ideal' ? '✔ Sincronia ideal' : s === 'aceitavel' ? 'Aceitável' : 'Inadequada'}
                  </Tag>
                </button>
              )
            })}
          </div>
          {!emb && <p className="mt-3 text-xs text-slate-400">Selecione um embrião à esquerda para habilitar as receptoras (mesmo haras).</p>}
        </div>
      </div>

      <div className="card flex flex-wrap gap-3 items-center justify-between p-4">
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <span className="font-bold text-purple-700">{doadoraSel ? `${doadoraSel.nome} (grau ${emb?.grau})` : 'Doadora/embrião'}</span>
          <ArrowRight size={18} />
          <span className="font-bold text-emerald-700">{recId ? db.animais.find((a) => a.id === recId)?.nome : 'Receptora'}</span>
        </div>
        <button className="btn-success" disabled={!embId || !recId} onClick={match}><CheckCircle2 size={18} /> Realizar Match / Inovulação</button>
      </div>

      <div className="card p-4">
        <h3 className="mb-2 font-bold text-slate-700">Transferências realizadas</h3>
        {db.embrioes.filter((e) => e.receptoraId).length === 0 ? <p className="text-sm text-slate-400">Nenhuma inovulação registrada.</p> : (
          <ul className="space-y-1 text-sm">
            {db.embrioes.filter((e) => e.receptoraId).map((e) => (
              <li key={e.id}>{fmtBR(e.inovuladoEm ?? e.data)} · <b>{db.animais.find((a) => a.id === e.doadoraId)?.nome}</b> → <b>{db.animais.find((a) => a.id === e.receptoraId)?.nome}</b> (grau {e.grau})</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
