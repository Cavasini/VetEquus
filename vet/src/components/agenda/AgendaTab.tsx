import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, Trash2, Zap } from 'lucide-react'
import { useVet } from '../../context/VetContext'
import type { Agendamento, TipoAgenda } from '../../types/vet'
import { DIAS_SEMANA, MESES, addDays, fmtBR, parseISO, toISO, todayISO } from '../../utils/date'
import { Empty } from '../common/ui'
import NovoAgendamentoModal from './NovoAgendamentoModal'

type Modo = 'semana' | 'mes' | 'lista'

const COR: Record<TipoAgenda, string> = {
  'Reprodução': 'bg-purple-100 text-purple-700 border-purple-300',
  'Exame Clínico': 'bg-blue-100 text-blue-700 border-blue-300',
  'Vacinação': 'bg-emerald-100 text-emerald-700 border-emerald-300',
  'Retorno de Medicação': 'bg-amber-100 text-amber-800 border-amber-300',
}

export default function AgendaTab() {
  const { agendaF, animalNome, harasNome, removerAgendamento, concluirAgendamento } = useVet()
  const [modo, setModo] = useState<Modo>('semana')
  const [ref, setRef] = useState(todayISO())
  const [novo, setNovo] = useState<string | null>(null)
  const hoje = todayISO()

  const porDia = (iso: string) => agendaF.filter((a) => a.data === iso).sort((a, b) => a.hora.localeCompare(b.hora))

  const Chip = ({ a }: { a: Agendamento }) => (
    <div className={`truncate rounded border px-1.5 py-0.5 text-[11px] font-semibold ${COR[a.tipo]} ${a.concluido ? 'opacity-50 line-through' : ''}`} title={`${a.hora} ${animalNome(a.animalId)} — ${a.obs}`}>
      {a.automatico && <Zap size={10} className="mr-0.5 inline" />}{a.hora} {animalNome(a.animalId)}
    </div>
  )

  const navegar = (dir: number) => {
    if (modo === 'mes') { const d = parseISO(ref); d.setMonth(d.getMonth() + dir); setRef(toISO(d)) }
    else setRef(addDays(ref, dir * (modo === 'semana' ? 7 : 1)))
  }

  const inicioSemana = addDays(ref, -parseISO(ref).getDay())
  const semana = Array.from({ length: 7 }, (_, i) => addDays(inicioSemana, i))

  const mesDias = (() => {
    const d = parseISO(ref)
    const first = new Date(d.getFullYear(), d.getMonth(), 1)
    const start = addDays(toISO(first), -first.getDay())
    return Array.from({ length: 42 }, (_, i) => addDays(start, i))
  })()

  const titulo = modo === 'mes' ? `${MESES[parseISO(ref).getMonth()]} ${parseISO(ref).getFullYear()}`
    : modo === 'semana' ? `${fmtBR(semana[0])} — ${fmtBR(semana[6])}` : fmtBR(ref)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-slate-800">Agenda</h1>
        <button className="btn-primary" onClick={() => setNovo(ref)}><Plus size={18} /> Novo agendamento</button>
      </div>

      <div className="card flex flex-wrap items-center justify-between gap-3 p-3">
        <div className="flex items-center gap-2">
          <button className="btn-secondary !px-3" onClick={() => navegar(-1)}><ChevronLeft size={18} /></button>
          <button className="btn-secondary" onClick={() => setRef(hoje)}>Hoje</button>
          <button className="btn-secondary !px-3" onClick={() => navegar(1)}><ChevronRight size={18} /></button>
          <span className="ml-2 font-bold text-slate-700">{titulo}</span>
        </div>
        <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
          {([['semana', 'Semanal'], ['mes', 'Mensal'], ['lista', 'Roteiro do Dia']] as const).map(([m, l]) => (
            <button key={m} onClick={() => setModo(m)} className={`cursor-pointer rounded-md px-4 py-1.5 text-sm font-semibold ${modo === m ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500'}`}>{l}</button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 text-xs">
        {(Object.keys(COR) as TipoAgenda[]).map((t) => <span key={t} className={`rounded-full border px-2.5 py-0.5 font-semibold ${COR[t]}`}>{t}</span>)}
        <span className="flex items-center gap-1 rounded-full border border-amber-300 bg-white px-2.5 py-0.5 font-semibold text-amber-700"><Zap size={11} /> Gatilho automático</span>
      </div>

      {modo === 'semana' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {semana.map((iso) => (
            <div key={iso} className={`card md:min-h-64 p-2 ${iso === hoje ? 'border-brand-500 ring-1 ring-brand-500' : ''}`}>
              <button className="mb-2 w-full cursor-pointer text-left" onClick={() => { setRef(iso); setModo('lista') }}>
                <div className="text-xs font-semibold text-slate-400">{DIAS_SEMANA[parseISO(iso).getDay()]}</div>
                <div className="text-lg font-bold text-slate-800">{parseISO(iso).getDate()}</div>
              </button>
              <div className="space-y-1">{porDia(iso).map((a) => <Chip key={a.id} a={a} />)}</div>
            </div>
          ))}
        </div>
      )}

      {modo === 'mes' && (
        <div className="card overflow-hidden">
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-xs font-semibold text-slate-500">
            {DIAS_SEMANA.map((d) => <div key={d} className="py-2">{d}</div>)}
          </div>
          <div className="grid grid-cols-7">
            {mesDias.map((iso) => {
              const fora = parseISO(iso).getMonth() !== parseISO(ref).getMonth()
              const itens = porDia(iso)
              return (
                <div key={iso} onClick={() => { setRef(iso); setModo('lista') }} className={`min-h-16 sm:min-h-24 cursor-pointer border-b border-r border-slate-100 p-1.5 hover:bg-slate-50 ${fora ? 'bg-slate-50/60 text-slate-300' : ''}`}>
                  <div className={`mb-1 text-xs font-bold ${iso === hoje ? 'inline-block rounded-full bg-brand-500 px-1.5 text-white' : ''}`}>{parseISO(iso).getDate()}</div>
                  <div className="space-y-0.5">
                    {itens.slice(0, 2).map((a) => <Chip key={a.id} a={a} />)}
                    {itens.length > 2 && <div className="text-[10px] font-semibold text-slate-400">+{itens.length - 2} mais</div>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {modo === 'lista' && (
        <div className="card p-5">
          <h2 className="mb-4 font-bold text-slate-800">Roteiro de {fmtBR(ref)}</h2>
          {porDia(ref).length === 0 ? <Empty text="Nenhum agendamento neste dia." /> : (
            <div className="space-y-2">
              {porDia(ref).map((a) => (
                <div key={a.id} className={`flex flex-wrap items-center gap-3 sm:gap-4 rounded-xl border p-3 ${a.concluido ? 'bg-slate-50 opacity-60' : ''}`}>
                  <div className="w-14 text-sm font-bold text-slate-700">{a.hora}</div>
                  <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${COR[a.tipo]}`}>{a.tipo}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-slate-800">
                      {animalNome(a.animalId)} {a.subtipo !== 'GERAL' && <span className="text-xs text-slate-400">({a.subtipo})</span>}
                      {a.automatico && <span className="ml-2 text-xs font-semibold text-amber-600"><Zap size={12} className="inline" /> Gatilho automático</span>}
                    </div>
                    <div className="text-xs text-slate-500">{harasNome(a.harasId)} · {a.obs || 'Sem observações'}</div>
                  </div>
                  {!a.concluido && <button className="btn-secondary !py-1.5" onClick={() => concluirAgendamento(a.id)}>Concluir</button>}
                  <button className="cursor-pointer rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600" onClick={() => removerAgendamento(a.id)}><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {novo && <NovoAgendamentoModal dataInicial={novo} onClose={() => setNovo(null)} />}
    </div>
  )
}
