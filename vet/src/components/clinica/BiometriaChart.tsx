import { useMemo } from 'react'
import { useVet } from '../../context/VetContext'
import { fmtBR, todayISO } from '../../utils/date'
import { Empty } from '../common/ui'

export default function BiometriaChart({ animalId }: { animalId: string }) {
  const { db, addBiometria } = useVet()
  const dados = useMemo(
    () => db.biometrias.filter((b) => b.animalId === animalId).sort((a, b) => a.data.localeCompare(b.data)),
    [db.biometrias, animalId],
  )

  const W = 560, H = 200, P = 34
  const novoPeso = () => {
    const v = prompt('Peso atual (kg):')
    const n = Number((v ?? '').replace(',', '.'))
    if (n > 0) addBiometria(animalId, n, todayISO())
  }

  const min = Math.min(...dados.map((d) => d.peso)) * 0.9
  const max = Math.max(...dados.map((d) => d.peso)) * 1.05
  const x = (i: number) => P + (dados.length === 1 ? (W - 2 * P) / 2 : (i * (W - 2 * P)) / (dados.length - 1))
  const y = (v: number) => H - P - ((v - min) / (max - min || 1)) * (H - 2 * P)

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h4 className="font-bold text-slate-700">Biometria — peso (kg)</h4>
        <button className="btn-secondary !py-1.5" onClick={novoPeso}>+ Registrar peso</button>
      </div>
      {dados.length === 0 ? <Empty text="Sem registros de peso." /> : (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-xl border border-slate-200 bg-white">
          {[0, 0.25, 0.5, 0.75, 1].map((t) => {
            const yy = P / 2 + t * (H - P * 1.5)
            return <line key={t} x1={P} x2={W - P / 2} y1={yy} y2={yy} stroke="#e2e8f0" />
          })}
          <polyline fill="none" stroke="#2563eb" strokeWidth={2.5} points={dados.map((d, i) => `${x(i)},${y(d.peso)}`).join(' ')} />
          {dados.map((d, i) => (
            <g key={d.id}>
              <circle cx={x(i)} cy={y(d.peso)} r={4.5} fill="#2563eb"><title>{`${fmtBR(d.data)}: ${d.peso} kg`}</title></circle>
              <text x={x(i)} y={y(d.peso) - 9} fontSize={10} textAnchor="middle" fill="#334155" fontWeight={600}>{d.peso}</text>
              <text x={x(i)} y={H - 10} fontSize={9} textAnchor="middle" fill="#94a3b8">{fmtBR(d.data).slice(0, 5)}</text>
            </g>
          ))}
        </svg>
      )}
      {dados.length > 1 && (
        <p className="mt-2 text-xs text-slate-500">
          Ganho total: <b>{(dados[dados.length - 1].peso - dados[0].peso).toFixed(0)} kg</b> em {dados.length} pesagens
          {' · '}Último: {dados[dados.length - 1].peso} kg
        </p>
      )}
    </div>
  )
}
