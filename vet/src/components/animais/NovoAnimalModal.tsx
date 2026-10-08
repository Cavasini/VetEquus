import { useState } from 'react'
import { useVet } from '../../context/VetContext'
import type { Animal, Categoria, StatusRepro } from '../../types/vet'
import { todayISO } from '../../utils/date'
import { Field, Modal } from '../common/ui'

const PELAGENS = ['Alazã', 'Castanha', 'Tordilha', 'Baia', 'Preta', 'Pampa', 'Palomino', 'Ruã']

export default function NovoAnimalModal({ onClose }: { onClose: () => void }) {
  const { db, harasFiltro, addAnimal } = useVet()
  const [f, setF] = useState({
    nome: '', categoria: 'Doadora' as Categoria, harasId: harasFiltro === 'todos' ? db.haras[0].id : harasFiltro,
    pelagem: 'Alazã', chip: '', registro: '', pai: '', mae: '', nascimento: todayISO(), status: 'Ativo' as StatusRepro,
  })
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((s) => ({ ...s, [k]: v }))

  const salvar = () => {
    const animal: Omit<Animal, 'id'> = {
      ...f, sexo: f.categoria === 'Garanhão' ? 'Macho' : f.categoria === 'Potro' ? 'Macho' : 'Fêmea',
      diaPosOv: null, edema: 0, clAtivo: false,
    }
    addAnimal(animal)
    onClose()
  }

  return (
    <Modal
      title="Cadastrar Novo Animal"
      onClose={onClose}
      footer={<><button className="btn-secondary" onClick={onClose}>Cancelar</button><button className="btn-primary" disabled={!f.nome.trim()} onClick={salvar}>Salvar animal</button></>}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2"><Field label="Nome"><input className="input" value={f.nome} onChange={(e) => set('nome', e.target.value)} /></Field></div>
        <Field label="Categoria">
          <select className="input" value={f.categoria} onChange={(e) => set('categoria', e.target.value as Categoria)}>
            {['Doadora', 'Receptora', 'Garanhão', 'Potro'].map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Haras">
          <select className="input" value={f.harasId} onChange={(e) => set('harasId', e.target.value)}>
            {db.haras.map((h) => <option key={h.id} value={h.id}>{h.nome}</option>)}
          </select>
        </Field>
        <Field label="Pelagem">
          <select className="input" value={f.pelagem} onChange={(e) => set('pelagem', e.target.value)}>{PELAGENS.map((p) => <option key={p}>{p}</option>)}</select>
        </Field>
        <Field label="Status reprodutivo">
          <select className="input" value={f.status} onChange={(e) => set('status', e.target.value as StatusRepro)}>
            {['Ativo', 'Em ciclo', 'Prenha', 'Vazia', 'Descanso'].map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Chip"><input className="input" value={f.chip} onChange={(e) => set('chip', e.target.value)} /></Field>
        <Field label="Nº de registro"><input className="input" value={f.registro} onChange={(e) => set('registro', e.target.value)} /></Field>
        <Field label="Pai"><input className="input" value={f.pai} onChange={(e) => set('pai', e.target.value)} /></Field>
        <Field label="Mãe"><input className="input" value={f.mae} onChange={(e) => set('mae', e.target.value)} /></Field>
        <Field label="Nascimento"><input type="date" className="input" value={f.nascimento} onChange={(e) => set('nascimento', e.target.value)} /></Field>
      </div>
    </Modal>
  )
}
