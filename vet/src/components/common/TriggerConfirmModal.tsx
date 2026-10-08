import { Zap } from 'lucide-react'
import { useVet } from '../../context/VetContext'
import { Modal } from './ui'

export default function TriggerConfirmModal() {
  const { trigger, closeTrigger } = useVet()
  if (!trigger) return null
  return (
    <div className="relative z-[60]">
      <Modal
        title={trigger.title}
        onClose={closeTrigger}
        footer={
          <>
            <button className="btn-secondary" onClick={closeTrigger}>{trigger.cancelLabel ?? 'Agora não'}</button>
            <button className="btn-primary" onClick={() => { trigger.onConfirm(); closeTrigger() }}>{trigger.confirmLabel ?? 'Confirmar'}</button>
          </>
        }
      >
        <div className="flex gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600"><Zap size={22} /></div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-amber-600">Gatilho inteligente</p>
            <p className="mt-1 text-slate-700">{trigger.message}</p>
          </div>
        </div>
      </Modal>
    </div>
  )
}
