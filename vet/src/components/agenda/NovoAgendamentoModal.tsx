import { useState } from 'react'
import { useVet } from '../../context/VetContext'
import type { TipoAgenda } from '../../types/vet'
import { todayISO } from '../../utils/date'
import { Field, Modal } from '../common/ui'

export const TIPOS: TipoAgenda[] = ['Reprodução', 'Exame Clínico', 'Vacinação', 'Retorno de Medicação']

export default function NovoAgendamentoModal({ onClose, dataInicial }: { onClose: () => void; dataInicial?: string }) {
  const { db, harasFiltro, addAgendamento } = useVet()
  const [data, setData] = useState(dataInicial ?? todayISO())
  const [hora, setHora] = useState('09:00')
  const [harasId, setHarasId] = useState(harasFiltro === 'todos' ? db.haras[0].id : harasFiltro)
  const [animalId, setAnimalId] = useState('')
  const [tipo, setTipo] = useState<TipoAgenda>('Reprodução')
  const [obs, setObs] = useState('')

  const animais = db.animais.filter((a) => a.harasId === harasId)
  const ok = animalId && data && hora

  return (
    <Modal
      title="Novo Agendamento"
      onClose={onClose}
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button
            className="btn-primary"
            disabled={!ok}
            onClick={() => { addAgendamento({ data, hora, harasId, animalId, tipo, subtipo: 'GERAL', obs }); onClose() }}
          >Agendar</button>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Data"><input type="date" className="input" value={data} onChange={(e) => setData(e.target.value)} /></Field>
        <Field label="Horário"><input type="time" className="input" value={hora} onChange={(e) => setHora(e.target.value)} /></Field>
        <Field label="Haras">
          <select className="input" value={harasId} onChange={(e) => { setHarasId(e.target.value); setAnimalId('') }}>
            {db.haras.map((h) => <option key={h.id} value={h.id}>{h.nome}</option>)}
          </select>
        </Field>
        <Field label="Animal">
          <select className="input" value={animalId} onChange={(e) => setAnimalId(e.target.value)}>
            <option value="">Selecione...</option>
            {animais.map((a) => <option key={a.id} value={a.id}>{a.nome} ({a.categoria})</option>)}
          </select>
        </Field>
        <div className="sm:col-span-2">
          <Field label="Tipo">
            <select className="input" value={tipo} onChange={(e) => setTipo(e.target.value as TipoAgenda)}>
              {TIPOS.map((t) => <option key={t}>{t}</option>)}
            </select>
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Observação"><textarea className="input" rows={3} value={obs} onChange={(e) => setObs(e.target.value)} /></Field>
        </div>
      </div>
    </Modal>
  )
}
