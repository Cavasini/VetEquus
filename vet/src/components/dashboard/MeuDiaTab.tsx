import { useState } from 'react'
import { AlertTriangle, Beaker, CheckCircle2, ClipboardCheck, Microscope, Syringe, Baby } from 'lucide-react'
import { useVet } from '../../context/VetContext'
import type { Agendamento } from '../../types/vet'
import { fmtBR, todayISO } from '../../utils/date'
import { CatBadge, Empty, Tag } from '../common/ui'
import QuickDGModal from './QuickDGModal'
import QuickLavagemModal from './QuickLavagemModal'
import QuickFolicularModal from './QuickFolicularModal'

const isDG = (s: string) => s.startsWith('DG')

export default function MeuDiaTab() {
  const { db, agendaF, animaisF, animalNome, harasNome, concluirAgendamento, setTab } = useVet()
  const [ativo, setAtivo] = useState<Agendamento | null>(null)
  const hoje = todayISO()

  const pendentes = agendaF.filter((a) => !a.concluido && a.data <= hoje).sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora))
  const doDia = pendentes.filter((p) => p.data === hoje)
  const idsF = new Set(animaisF.map((a) => a.id))
  const vencidas = db.vacinas.filter((v) => idsF.has(v.animalId) && v.vencimento < hoje)
  const animaisVenc = new Set(vencidas.map((v) => v.animalId))

  const cards = [
    { l: 'Controles foliculares', v: doDia.filter((p) => p.subtipo === 'FOLICULAR').length, i: Microscope, c: 'text-purple-600 bg-purple-100' },
    { l: 'Lavagens (D8/D9)', v: doDia.filter((p) => p.subtipo === 'LAVAGEM').length, i: Beaker, c: 'text-sky-600 bg-sky-100' },
    { l: 'Diagnósticos de gestação', v: doDia.filter((p) => isDG(p.subtipo)).length, i: Baby, c: 'text-emerald-600 bg-emerald-100' },
    { l: 'Vacinas atrasadas / alertas', v: vencidas.length, i: AlertTriangle, c: 'text-red-600 bg-red-100' },
  ]

  const abrir = (a: Agendamento) => {
    if (a.subtipo === 'GERAL') { concluirAgendamento(a.id); return }
    setAtivo(a)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800">Meu Dia</h1>
        <p className="text-sm text-slate-500">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ l, v, i: Icon, c }) => (
          <div key={l} className="card flex items-center gap-4 p-5">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${c}`}><Icon size={24} /></div>
            <div>
              <div className="text-3xl font-extrabold text-slate-800">{v}</div>
              <div className="text-xs font-semibold text-slate-500">{l}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2 p-5">
          <h2 className="mb-4 flex items-center gap-2 font-bold text-slate-800"><ClipboardCheck size={20} className="text-brand-500" /> Ações do dia</h2>
          {pendentes.length === 0 ? <Empty text="🎉 Nenhuma ação pendente para hoje." /> : (
            <div className="space-y-2">
              {pendentes.map((a) => {
                const animal = db.animais.find((x) => x.id === a.animalId)
                const atrasado = a.data < hoje
                const label = isDG(a.subtipo) ? a.subtipo : a.subtipo === 'LAVAGEM' ? 'Lavagem' : a.subtipo === 'FOLICULAR' ? 'Folicular' : 'Atendimento'
                const cor = isDG(a.subtipo) ? 'green' : a.subtipo === 'LAVAGEM' ? 'sky' : a.subtipo === 'FOLICULAR' ? 'purple' : 'slate'
                return (
                  <div key={a.id} className="flex flex-wrap items-center gap-3 sm:gap-4 rounded-xl border border-slate-200 p-3 hover:bg-slate-50">
                    <div className="w-14 text-center text-sm font-bold text-slate-700">{a.hora}</div>
                    <Tag color={cor}>{label}</Tag>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 font-semibold text-slate-800">
                        {animalNome(a.animalId)} {animal && <CatBadge cat={animal.categoria} />}
                        {atrasado && <Tag color="red">Atrasado {fmtBR(a.data)}</Tag>}
                        {a.automatico && <Tag color="amber">⚡ Gatilho</Tag>}
                      </div>
                      <div className="truncate text-xs text-slate-500">{harasNome(a.harasId)} · {a.obs}</div>
                    </div>
                    <button className="btn-primary !py-2" onClick={() => abrir(a)}>
                      {a.subtipo === 'GERAL' ? <><CheckCircle2 size={16} /> Concluir</> : 'Registrar'}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="card p-5">
          <h2 className="mb-4 flex items-center gap-2 font-bold text-slate-800"><Syringe size={20} className="text-red-500" /> Alertas clínicos</h2>
          {animaisVenc.size === 0 ? <Empty text="Nenhum alerta." /> : (
            <ul className="space-y-2">
              {[...animaisVenc].slice(0, 8).map((id) => {
                const lista = vencidas.filter((v) => v.animalId === id)
                return (
                  <li key={id} className="flex items-start justify-between gap-2 rounded-lg bg-red-50 p-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-800">{animalNome(id)}</div>
                      <div className="text-xs text-red-700">{lista.map((l) => l.tipo).join(', ')} vencida(s)</div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
          <button className="btn-secondary mt-4 w-full" onClick={() => setTab('clinica')}>Ir para medicina preventiva</button>
        </div>
      </div>

      {ativo && isDG(ativo.subtipo) && <QuickDGModal ag={ativo} onClose={() => setAtivo(null)} />}
      {ativo && ativo.subtipo === 'LAVAGEM' && <QuickLavagemModal ag={ativo} onClose={() => setAtivo(null)} />}
      {ativo && ativo.subtipo === 'FOLICULAR' && <QuickFolicularModal ag={ativo} onClose={() => setAtivo(null)} />}
    </div>
  )
}
