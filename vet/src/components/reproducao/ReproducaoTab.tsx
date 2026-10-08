import { useState } from 'react'
import { Dna, Snowflake, Microscope } from 'lucide-react'
import MatchPanel from './MatchPanel'
import BotijaoSemen from './BotijaoSemen'
import FolicularInducao from './FolicularInducao'

const SUBS = [
  { id: 'match', label: 'Sincronização / Match TE', icon: Dna },
  { id: 'botijao', label: 'Estoque de Sêmen', icon: Snowflake },
  { id: 'folicular', label: 'Controle Folicular & Indução', icon: Microscope },
] as const

export default function ReproducaoTab() {
  const [sub, setSub] = useState<(typeof SUBS)[number]['id']>('match')
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold text-slate-800">Reprodução</h1>
      <div className="flex w-fit gap-1 rounded-lg bg-slate-100 p-1">
        {SUBS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setSub(id)} className={`flex cursor-pointer items-center gap-2 rounded-md px-5 py-2 text-sm font-semibold ${sub === id ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500'}`}><Icon size={16} /> {label}</button>
        ))}
      </div>
      {sub === 'match' && <MatchPanel />}
      {sub === 'botijao' && <BotijaoSemen />}
      {sub === 'folicular' && <FolicularInducao />}
    </div>
  )
}
