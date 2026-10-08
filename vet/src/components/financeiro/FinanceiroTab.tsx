import { useState } from 'react'
import { FileSignature, Plus, Receipt } from 'lucide-react'
import { useVet } from '../../context/VetContext'
import type { Fatura } from '../../types/vet'
import { brl, fmtBR, todayISO } from '../../utils/date'
import { Empty, Field, Tag } from '../common/ui'
import FechamentoMesModal from './FechamentoMesModal'
import TermosJuridicos from './TermosJuridicos'

const PROCS = [
  { d: 'Visita clínica', v: 250 }, { d: 'Lavagem uterina', v: 450 }, { d: 'Ultrassom reprodutivo', v: 60 },
  { d: 'Diária de tronco', v: 80 }, { d: 'Km rodado', v: 3.5 },
]

export default function FinanceiroTab() {
  const { db, harasFiltro, harasNome, addLancamento, fecharMes } = useVet()
  const [sub, setSub] = useState<'faturamento' | 'termos'>('faturamento')
  const [fatura, setFatura] = useState<Fatura | null>(null)
  const [proc, setProc] = useState(0)
  const [qtd, setQtd] = useState(1)
  const [harasId, setHarasId] = useState(db.haras[0].id)

  const hs = harasFiltro === 'todos' ? harasId : harasFiltro
  const abertos = db.lancamentos.filter((l) => !l.faturaId && (harasFiltro === 'todos' || l.harasId === harasFiltro))
  const totalAberto = abertos.reduce((s, l) => s + l.qtd * l.valorUnit, 0)
  const fats = db.faturas.filter((f) => harasFiltro === 'todos' || f.harasId === harasFiltro)

  const fechar = () => {
    const alvo = harasFiltro === 'todos' ? null : harasFiltro
    if (!alvo) return
    const f = fecharMes(alvo)
    if (f) setFatura(f)
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold text-slate-800">Administrativo e Financeiro</h1>
      <div className="flex w-fit max-w-full overflow-x-auto gap-1 rounded-lg bg-slate-100 p-1">
        {([['faturamento', 'Faturamento', Receipt], ['termos', 'Termos Jurídicos', FileSignature]] as const).map(([k, l, Icon]) => (
          <button key={k} onClick={() => setSub(k)} className={`flex cursor-pointer items-center gap-2 rounded-md px-5 py-2 whitespace-nowrap text-sm font-semibold ${sub === k ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500'}`}><Icon size={16} /> {l}</button>
        ))}
      </div>

      {sub === 'termos' && <TermosJuridicos />}

      {sub === 'faturamento' && (
        <>
          <div className="card flex flex-wrap items-end gap-3 p-4">
            {harasFiltro === 'todos' && <Field label="Haras"><select className="input sm:!w-52" value={harasId} onChange={(e) => setHarasId(e.target.value)}>{db.haras.map((h) => <option key={h.id} value={h.id}>{h.nome}</option>)}</select></Field>}
            <Field label="Procedimento"><select className="input sm:!w-56" value={proc} onChange={(e) => setProc(Number(e.target.value))}>{PROCS.map((p, i) => <option key={p.d} value={i}>{p.d} — {brl(p.v)}</option>)}</select></Field>
            <Field label="Qtd"><input type="number" min={1} className="input sm:!w-24" value={qtd} onChange={(e) => setQtd(Math.max(1, Number(e.target.value)))} /></Field>
            <button className="btn-secondary" onClick={() => addLancamento({ harasId: hs, data: todayISO(), descricao: PROCS[proc].d, qtd, valorUnit: PROCS[proc].v })}><Plus size={16} /> Lançar</button>
            <div className="ml-auto text-right">
              <div className="text-xs font-semibold uppercase text-slate-400">Em aberto</div>
              <div className="text-2xl font-extrabold text-slate-800">{brl(totalAberto)}</div>
            </div>
            <button className="btn-primary" disabled={harasFiltro === 'todos'} title={harasFiltro === 'todos' ? 'Selecione um haras no cabeçalho' : ''} onClick={fechar}><Receipt size={16} /> Fechar Mês / Gerar Fatura</button>
          </div>
          {harasFiltro === 'todos' && <p className="-mt-3 text-xs text-slate-500">Selecione um haras específico no cabeçalho para fechar a fatura.</p>}

          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Data</th><th>Haras</th><th>Procedimento</th><th className="text-right">Qtd</th><th className="text-right">Unit.</th><th className="px-4 text-right">Total</th></tr></thead>
              <tbody>
                {abertos.sort((a, b) => b.data.localeCompare(a.data)).map((l) => (
                  <tr key={l.id} className="border-t border-slate-100"><td className="px-4 py-2.5">{fmtBR(l.data)}</td><td>{harasNome(l.harasId)}</td><td>{l.descricao}</td><td className="text-right">{l.qtd}</td><td className="text-right">{brl(l.valorUnit)}</td><td className="px-4 text-right font-semibold">{brl(l.qtd * l.valorUnit)}</td></tr>
                ))}
                {abertos.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-slate-400">Sem lançamentos em aberto.</td></tr>}
              </tbody>
            </table>
          </div>

          <div className="card p-5">
            <h3 className="mb-3 font-bold text-slate-800">Faturas emitidas</h3>
            {fats.length === 0 ? <Empty text="Nenhuma fatura emitida." /> : (
              <div className="space-y-2">
                {fats.map((f) => (
                  <button key={f.id} onClick={() => setFatura(f)} className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-slate-200 p-3 text-left hover:bg-slate-50">
                    <span className="font-semibold">{harasNome(f.harasId)} <span className="text-xs font-normal text-slate-500">· {fmtBR(f.data)}</span></span>
                    <span className="flex items-center gap-3"><Tag color="green">Emitida</Tag><b>{brl(f.total)}</b></span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {fatura && <FechamentoMesModal fatura={fatura} onClose={() => setFatura(null)} />}
    </div>
  )
}
