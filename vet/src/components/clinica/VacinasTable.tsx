import { Check } from 'lucide-react'
import { useVet } from '../../context/VetContext'
import type { TipoVacina } from '../../types/vet'
import { fmtBR, todayISO } from '../../utils/date'
import { CatBadge } from '../common/ui'

const TIPOS: TipoVacina[] = ['Gripe', 'Tétano', 'Encefalomielite', 'Raiva', 'Rinopneumonite', 'Vermífugo']

export default function VacinasTable() {
  const { db, animaisF, registrarVacina } = useVet()
  const hoje = todayISO()
  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
          <tr><th className="px-4 py-3 text-left">Animal</th>{TIPOS.map((t) => <th key={t} className="px-2 py-3 text-center">{t}</th>)}</tr>
        </thead>
        <tbody>
          {animaisF.map((a) => (
            <tr key={a.id} className="border-t border-slate-100">
              <td className="px-4 py-2"><div className="font-semibold">{a.nome}</div><CatBadge cat={a.categoria} /></td>
              {TIPOS.map((t) => {
                const v = db.vacinas.find((x) => x.animalId === a.id && x.tipo === t)
                const ok = v && v.vencimento >= hoje
                return (
                  <td key={t} className="px-2 py-2 text-center">
                    <div className={`mx-auto w-28 rounded-lg border p-1.5 ${ok ? 'border-emerald-300 bg-emerald-100 text-emerald-700' : 'border-red-300 bg-red-100 text-red-700'}`}>
                      <div className="text-[11px] font-bold">{ok ? 'Em dia' : v ? 'Vencido' : 'Sem registro'}</div>
                      <div className="text-[10px]">{v ? `até ${fmtBR(v.vencimento)}` : '—'}</div>
                      <button onClick={() => registrarVacina(a.id, t)} className="mt-1 flex w-full cursor-pointer items-center justify-center gap-1 rounded bg-white/80 py-0.5 text-[10px] font-bold hover:bg-white">
                        <Check size={10} /> Registrar
                      </button>
                    </div>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
