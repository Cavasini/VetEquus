import { useState } from 'react'
import { LayoutGrid, List, MapPin, Phone, Plus, Search } from 'lucide-react'
import { useVet } from '../../context/VetContext'
import type { Animal, Categoria } from '../../types/vet'
import { brl } from '../../utils/date'
import { CAT_STYLE, CatBadge, Tag } from '../common/ui'
import NovoAnimalModal from './NovoAnimalModal'
import PerfilAnimalModal from './PerfilAnimalModal'

const CATS: Categoria[] = ['Doadora', 'Receptora', 'Garanhão', 'Potro']
const STATUS = ['Em ciclo', 'Prenha', 'Vazia', 'Descanso', 'Ativo']

export default function AnimaisTab() {
  const { db, animaisF, harasFiltro } = useVet()
  const [sub, setSub] = useState<'animais' | 'clientes'>('animais')
  const [vista, setVista] = useState<'grade' | 'tabela'>('grade')
  const [cat, setCat] = useState<Categoria | ''>('')
  const [status, setStatus] = useState('')
  const [busca, setBusca] = useState('')
  const [perfil, setPerfil] = useState<string | null>(null)
  const [novo, setNovo] = useState(false)

  const lista = animaisF.filter((a) => (!cat || a.categoria === cat) && (!status || a.status === status) && a.nome.toLowerCase().includes(busca.toLowerCase()))
  const perfilAnimal: Animal | undefined = db.animais.find((a) => a.id === perfil)
  const harasLista = db.haras.filter((h) => harasFiltro === 'todos' || h.id === harasFiltro)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-slate-800">Clientes e Animais</h1>
        <button className="btn-primary" onClick={() => setNovo(true)}><Plus size={18} /> Novo animal</button>
      </div>

      <div className="flex w-fit max-w-full overflow-x-auto gap-1 rounded-lg bg-slate-100 p-1">
        {([['animais', 'Animais'], ['clientes', 'Clientes / Haras']] as const).map(([k, l]) => (
          <button key={k} onClick={() => setSub(k)} className={`cursor-pointer rounded-md px-5 py-2 whitespace-nowrap text-sm font-semibold ${sub === k ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500'}`}>{l}</button>
        ))}
      </div>

      {sub === 'clientes' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {harasLista.map((h) => {
            const qtd = db.animais.filter((a) => a.harasId === h.id).length
            const pend = db.lancamentos.filter((l) => l.harasId === h.id && !l.faturaId).reduce((s, l) => s + l.qtd * l.valorUnit, 0)
            return (
              <div key={h.id} className="card p-5">
                <div className="mb-3 text-lg font-bold text-slate-800">{h.nome}</div>
                <div className="space-y-1.5 text-sm text-slate-600">
                  <div>👤 {h.responsavel}</div>
                  <div className="flex items-center gap-2"><Phone size={14} /> {h.telefone}
                    <a className="text-xs font-semibold text-emerald-600 hover:underline" target="_blank" rel="noreferrer" href={`https://wa.me/55${h.telefone.replace(/\D/g, '')}`}>WhatsApp</a></div>
                  <div className="flex items-start gap-2"><MapPin size={14} className="mt-0.5 shrink-0" /> {h.endereco}</div>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                  <Tag color="blue">{qtd} animais</Tag>
                  <Tag color={pend > 0 ? 'amber' : 'green'}>{pend > 0 ? `Pendente ${brl(pend)}` : 'Sem pendências'}</Tag>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {sub === 'animais' && (
        <>
          <div className="card flex flex-wrap items-center gap-3 p-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-3 text-slate-400" />
              <input className="input sm:!w-56 !pl-9" placeholder="Buscar animal..." value={busca} onChange={(e) => setBusca(e.target.value)} />
            </div>
            <div className="flex gap-1.5">
              <button onClick={() => setCat('')} className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold ${!cat ? 'border-slate-800 bg-slate-800 text-white' : 'border-slate-300'}`}>Todas</button>
              {CATS.map((c) => (
                <button key={c} onClick={() => setCat(cat === c ? '' : c)} className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold ${CAT_STYLE[c].badge} ${cat === c ? 'ring-2 ring-slate-800' : ''}`}>{c}s</button>
              ))}
            </div>
            <select className="input sm:!w-44" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Todos os status</option>
              {STATUS.map((s) => <option key={s}>{s}</option>)}
            </select>
            <div className="ml-auto flex gap-1 rounded-lg bg-slate-100 p-1">
              <button onClick={() => setVista('grade')} className={`cursor-pointer rounded-md p-2 ${vista === 'grade' ? 'bg-white shadow-sm' : ''}`}><LayoutGrid size={16} /></button>
              <button onClick={() => setVista('tabela')} className={`cursor-pointer rounded-md p-2 ${vista === 'tabela' ? 'bg-white shadow-sm' : ''}`}><List size={16} /></button>
            </div>
          </div>

          {vista === 'grade' ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {lista.map((a) => (
                <button key={a.id} onClick={() => setPerfil(a.id)} className="card cursor-pointer overflow-hidden text-left transition hover:shadow-md">
                  <div className={`h-1.5 ${CAT_STYLE[a.categoria].solid}`} />
                  <div className="p-4">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div className="font-bold text-slate-800">{a.nome}</div>
                      <CatBadge cat={a.categoria} />
                    </div>
                    <div className="text-xs text-slate-500">{a.pelagem} · {db.haras.find((h) => h.id === a.harasId)?.nome}</div>
                    <div className="mt-3 flex gap-1.5"><Tag>{a.status}</Tag>{a.diaPosOv != null && <Tag color="blue">D{a.diaPosOv}</Tag>}</div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="card overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                  <tr><th className="px-4 py-3">Nome</th><th>Categoria</th><th>Haras</th><th>Pelagem</th><th>Status</th><th>Registro</th></tr>
                </thead>
                <tbody>
                  {lista.map((a) => (
                    <tr key={a.id} onClick={() => setPerfil(a.id)} className="cursor-pointer border-t border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 font-semibold">{a.nome}</td>
                      <td><CatBadge cat={a.categoria} /></td>
                      <td>{db.haras.find((h) => h.id === a.harasId)?.nome}</td>
                      <td>{a.pelagem}</td><td><Tag>{a.status}</Tag></td><td className="text-xs text-slate-500">{a.registro}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {lista.length === 0 && <div className="py-10 text-center text-slate-400">Nenhum animal encontrado.</div>}
        </>
      )}

      {perfilAnimal && <PerfilAnimalModal animal={perfilAnimal} onClose={() => setPerfil(null)} />}
      {novo && <NovoAnimalModal onClose={() => setNovo(false)} />}
    </div>
  )
}
