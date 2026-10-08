import { useState } from 'react'
import { MinusCircle } from 'lucide-react'
import { useVet } from '../../context/VetContext'
import { fmtBR } from '../../utils/date'
import { Modal, Field, Tag } from '../common/ui'
import type { Palheta } from '../../types/vet'

export default function BotijaoSemen() {
  const { db, animaisF, baixaPalheta } = useVet()
  const [baixa, setBaixa] = useState<Palheta | null>(null)
  const [qtd, setQtd] = useState(1)
  const [canSel, setCanSel] = useState<number | null>(null)

  const ids = new Set(animaisF.map((a) => a.id))
  const palhetas = db.palhetas.filter((p) => ids.has(p.garanhaoId))
  const nomeG = (id: string) => db.animais.find((a) => a.id === id)?.nome ?? '-'

  const saldoCan = (c: number) => palhetas.filter((p) => p.canister === c).reduce((s, p) => s + p.saldo, 0)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="card p-4">
        <h3 className="mb-3 font-bold text-slate-700">Botijão criogênico</h3>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6].map((c) => {
            const saldo = saldoCan(c)
            return (
              <button key={c} onClick={() => setCanSel(canSel === c ? null : c)} className={`cursor-pointer rounded-xl border-2 p-3 text-center ${canSel === c ? 'border-amber-500 bg-amber-50' : 'border-slate-200'}`}>
                <div className="mx-auto mb-1 h-14 w-6 rounded-b-full rounded-t-md border-2 border-slate-400 bg-gradient-to-b from-slate-100 to-sky-200" />
                <div className="text-xs font-bold text-slate-600">Canister {c}</div>
                <div className="text-lg font-extrabold text-amber-700">{saldo}</div>
              </button>
            )
          })}
        </div>
        {canSel && (
          <div className="mt-4 space-y-1.5 text-sm">
            <div className="font-semibold text-slate-600">Canister {canSel} — racks:</div>
            {[1, 2, 3].map((r) => {
              const ps = palhetas.filter((p) => p.canister === canSel && p.rack === r)
              return (
                <div key={r} className="rounded-lg bg-slate-50 px-3 py-2">
                  <b>Rack {r}</b>: {ps.length ? ps.map((p) => `${nomeG(p.garanhaoId)} (${p.saldo})`).join(', ') : <span className="text-slate-400">vazio</span>}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="card lg:col-span-2 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr><th className="px-4 py-3">Garanhão</th><th>Lote</th><th>Congelamento</th><th>Mot.</th><th>Vigor</th><th>Local</th><th>Saldo</th><th /></tr>
          </thead>
          <tbody>
            {palhetas.map((p) => (
              <tr key={p.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-semibold text-amber-800">{nomeG(p.garanhaoId)}</td>
                <td>{p.lote}</td><td>{fmtBR(p.congelamento)}</td>
                <td>{p.motilidade}%</td><td>{p.vigor}/5</td>
                <td className="text-xs text-slate-500">C{p.canister} · R{p.rack}</td>
                <td><Tag color={p.saldo <= 5 ? 'red' : p.saldo <= 15 ? 'amber' : 'green'}>{p.saldo} palhetas</Tag></td>
                <td><button className="btn-secondary !px-3 !py-1.5" disabled={p.saldo === 0} onClick={() => { setBaixa(p); setQtd(1) }}><MinusCircle size={15} /> Baixa</button></td>
              </tr>
            ))}
            {palhetas.length === 0 && <tr><td colSpan={8} className="p-8 text-center text-slate-400">Sem estoque para o haras selecionado.</td></tr>}
          </tbody>
        </table>
      </div>

      {baixa && (
        <Modal
          title={`Baixa de palhetas — ${nomeG(baixa.garanhaoId)}`}
          onClose={() => setBaixa(null)}
          footer={<><button className="btn-secondary" onClick={() => setBaixa(null)}>Cancelar</button><button className="btn-primary" onClick={() => { baixaPalheta(baixa.id, qtd); setBaixa(null) }}>Confirmar baixa</button></>}
        >
          <Field label={`Quantidade (saldo ${baixa.saldo})`}>
            <input type="number" min={1} max={baixa.saldo} className="input" value={qtd} onChange={(e) => setQtd(Math.min(baixa.saldo, Math.max(1, Number(e.target.value))))} />
          </Field>
        </Modal>
      )}
    </div>
  )
}
