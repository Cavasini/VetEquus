import { useVet } from '../../context/VetContext'
import type { Agendamento } from '../../types/vet'
import { Modal } from '../common/ui'
import FolicularForm from '../reproducao/FolicularForm'

export default function QuickFolicularModal({ ag, onClose }: { ag: Agendamento; onClose: () => void }) {
  const { animalNome } = useVet()
  return (
    <Modal title={`Controle Folicular — ${animalNome(ag.animalId)}`} onClose={onClose} wide>
      <FolicularForm animalId={ag.animalId} agId={ag.id} onSaved={onClose} />
    </Modal>
  )
}
