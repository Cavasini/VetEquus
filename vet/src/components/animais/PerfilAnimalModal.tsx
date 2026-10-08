import { useVet } from '../../context/VetContext'
import type { Animal } from '../../types/vet'
import { fmtBR, todayISO } from '../../utils/date'
import BiometriaChart from '../clinica/BiometriaChart'
import { CatBadge, Empty, Modal, Tag } from '../common/ui'

export default function PerfilAnimalModal({ animal, onClose }: { animal: Animal; onClose: () => void }) {
  const { db, harasNome } = useVet()
  const hoje = todayISO()
  const vacinas = db.vacinas.filter((v) => v.animalId === animal.id)
  const folic = db.foliculares.filter((f) => f.animalId === animal.id).slice(-3).reverse()
  const embrioes = db.embrioes.filter((e) => e.doadoraId === animal.id || e.receptoraId === animal.id)
  const consultas = db.consultas.filter((c) => c.animalId === animal.id)

  const dados: [string, string][] = [
    ['Haras', harasNome(animal.harasId)], ['Pelagem', animal.pelagem], ['Sexo', animal.sexo],
    ['Nascimento', fmtBR(animal.nascimento)], ['Chip', animal.chip || '-'], ['Registro', animal.registro || '-'],
    ['Pai', animal.pai || '-'], ['Mãe', animal.mae || '-'],
  ]

  return (
    <Modal title={animal.nome} onClose={onClose} wide>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <CatBadge cat={animal.categoria} /><Tag>{animal.status}</Tag>
          {animal.diaPosOv != null && <Tag color="blue">D{animal.diaPosOv} pós-ovulação</Tag>}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {dados.map(([k, v]) => (
            <div key={k} className="rounded-lg bg-slate-50 p-3">
              <div className="text-[11px] font-semibold uppercase text-slate-400">{k}</div>
              <div className="text-sm font-semibold text-slate-800">{v}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="mb-2 font-bold text-slate-700">Vacinas e vermífugos</h4>
            <div className="space-y-1.5">
              {vacinas.map((v) => (
                <div key={v.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-1.5 text-sm">
                  <span className="font-medium">{v.tipo}</span>
                  <span className="flex items-center gap-2 text-xs text-slate-500">{fmtBR(v.vencimento)}
                    <Tag color={v.vencimento < hoje ? 'red' : 'green'}>{v.vencimento < hoje ? 'Vencido' : 'Em dia'}</Tag>
                  </span>
                </div>
              ))}
              {vacinas.length === 0 && <Empty text="Sem registros." />}
            </div>
          </div>
          <div>
            <h4 className="mb-2 font-bold text-slate-700">Histórico reprodutivo</h4>
            <div className="space-y-1.5 text-sm">
              {folic.map((f) => (
                <div key={f.id} className="rounded-lg border border-slate-200 px-3 py-1.5">
                  <b>{fmtBR(f.data)}</b> · OD {f.ovD}mm / OE {f.ovE}mm · edema {f.edema} · CL {f.cl}
                </div>
              ))}
              {embrioes.map((e) => (
                <div key={e.id} className="rounded-lg border border-purple-200 bg-purple-50 px-3 py-1.5">
                  Embrião grau {e.grau} ({fmtBR(e.data)}) {e.receptoraId ? `→ inovulado` : '→ disponível'}
                </div>
              ))}
              {folic.length + embrioes.length === 0 && <Empty text="Sem registros reprodutivos." />}
            </div>
            <h4 className="mb-2 mt-4 font-bold text-slate-700">Consultas clínicas</h4>
            {consultas.map((c) => (
              <div key={c.id} className="mb-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm"><b>{fmtBR(c.data)}</b> · {c.diagnostico}</div>
            ))}
            {consultas.length === 0 && <Empty text="Sem consultas." />}
          </div>
        </div>
        <BiometriaChart animalId={animal.id} />
      </div>
    </Modal>
  )
}
