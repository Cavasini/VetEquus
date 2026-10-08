import { CheckCircle2, Info, XCircle } from 'lucide-react'
import { useVet } from '../../context/VetContext'

export default function Toast() {
  const { toasts, dismissToast } = useVet()
  return (
    <div className="no-print fixed bottom-5 right-5 z-[70] flex flex-col gap-2">
      {toasts.map((t) => (
        <div key={t.id} onClick={() => dismissToast(t.id)} className="flex max-w-sm cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg">
          {t.kind === 'success' && <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-500" size={20} />}
          {t.kind === 'info' && <Info className="mt-0.5 shrink-0 text-sky-500" size={20} />}
          {t.kind === 'error' && <XCircle className="mt-0.5 shrink-0 text-red-500" size={20} />}
          <span className="text-sm text-slate-700">{t.text}</span>
        </div>
      ))}
    </div>
  )
}
