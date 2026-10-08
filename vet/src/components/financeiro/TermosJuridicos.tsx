import { useEffect, useRef, useState } from 'react'
import { Eraser, Save } from 'lucide-react'
import { useVet } from '../../context/VetContext'
import { fmtBR, todayISO } from '../../utils/date'
import { Empty, Field } from '../common/ui'

const MODELOS: Record<string, string> = {
  'Termo de Consentimento para Cirurgia': 'autoriza a realização do procedimento cirúrgico no animal acima identificado, declarando estar ciente dos riscos inerentes ao ato cirúrgico e anestésico, bem como das possíveis complicações.',
  'Termo de TE (Transferência de Embriões)': 'autoriza a realização de coleta e/ou transferência de embrião (TE) envolvendo o animal acima identificado, ciente de que o resultado depende de fatores biológicos e que não há garantia de gestação.',
  'Termo de Anestesia': 'autoriza a realização de sedação/anestesia no animal acima identificado, declarando ciência dos riscos anestésicos, incluindo, em casos raros, intercorrências graves.',
  'Termo de Inseminação': 'autoriza a realização de inseminação artificial no animal acima identificado, ciente de que a taxa de concepção varia conforme a qualidade do sêmen e as condições reprodutivas da égua.',
}

export default function TermosJuridicos() {
  const { db, harasFiltro, salvarTermo, animalNome, harasNome } = useVet()
  const [modelo, setModelo] = useState(Object.keys(MODELOS)[0])
  const [harasId, setHarasId] = useState(harasFiltro === 'todos' ? db.haras[0].id : harasFiltro)
  const [animalId, setAnimalId] = useState('')
  const [hasInk, setHasInk] = useState(false)
  const canvas = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)

  const haras = db.haras.find((h) => h.id === harasId)!
  const animais = db.animais.filter((a) => a.harasId === harasId)
  const animal = animais.find((a) => a.id === animalId)

  useEffect(() => { if (harasFiltro !== 'todos') setHarasId(harasFiltro) }, [harasFiltro])

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = canvas.current!
    const r = c.getBoundingClientRect()
    return { x: ((e.clientX - r.left) * c.width) / r.width, y: ((e.clientY - r.top) * c.height) / r.height }
  }
  const down = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const ctx = canvas.current!.getContext('2d')!
    canvas.current!.setPointerCapture(e.pointerId)
    drawing.current = true
    const { x, y } = pos(e)
    ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.strokeStyle = '#0f172a'
    ctx.beginPath(); ctx.moveTo(x, y)
  }
  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return
    const ctx = canvas.current!.getContext('2d')!
    const { x, y } = pos(e)
    ctx.lineTo(x, y); ctx.stroke()
    setHasInk(true)
  }
  const up = () => { drawing.current = false }
  const limpar = () => {
    const c = canvas.current!
    c.getContext('2d')!.clearRect(0, 0, c.width, c.height)
    setHasInk(false)
  }
  const salvar = () => {
    salvarTermo({ modelo, harasId, animalId, data: todayISO(), assinatura: canvas.current!.toDataURL('image/png') })
    limpar()
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div className="card space-y-4 p-5">
        <h3 className="font-bold text-slate-800">Novo termo</h3>
        <Field label="Modelo">
          <select className="input" value={modelo} onChange={(e) => setModelo(e.target.value)}>{Object.keys(MODELOS).map((m) => <option key={m}>{m}</option>)}</select>
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Haras / Cliente"><select className="input" value={harasId} onChange={(e) => { setHarasId(e.target.value); setAnimalId('') }}>{db.haras.map((h) => <option key={h.id} value={h.id}>{h.nome}</option>)}</select></Field>
          <Field label="Animal"><select className="input" value={animalId} onChange={(e) => setAnimalId(e.target.value)}><option value="">Selecione...</option>{animais.map((a) => <option key={a.id} value={a.id}>{a.nome}</option>)}</select></Field>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
          <div className="mb-2 text-center font-bold uppercase">{modelo}</div>
          Eu, <b>{haras.responsavel}</b>, CPF <b>{haras.cpf}</b>, responsável pelo <b>{haras.nome}</b> ({haras.endereco}),{' '}
          {MODELOS[modelo]}
          <div className="mt-2 rounded bg-white p-2 text-xs">
            <b>Animal:</b> {animal ? `${animal.nome} · ${animal.categoria} · ${animal.pelagem} · Reg. ${animal.registro} · Chip ${animal.chip}` : <span className="text-red-500">selecione um animal</span>}
          </div>
          <div className="mt-2 text-xs text-slate-500">Data: {fmtBR(todayISO())}</div>
        </div>
        <Field label="Assinatura digital (mouse, touchpad ou stylus)">
          <canvas ref={canvas} width={560} height={160} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerLeave={up}
            className="w-full touch-none rounded-xl border-2 border-dashed border-slate-300 bg-white" style={{ cursor: 'crosshair' }} />
        </Field>
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={limpar}><Eraser size={16} /> Limpar</button>
          <button className="btn-primary flex-1" disabled={!hasInk || !animalId} onClick={salvar}><Save size={16} /> Assinar e salvar termo</button>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="mb-3 font-bold text-slate-800">Termos assinados</h3>
        {db.termos.length === 0 ? <Empty text="Nenhum termo assinado ainda." /> : (
          <div className="space-y-3">
            {db.termos.map((t) => (
              <div key={t.id} className="flex items-center gap-4 rounded-xl border border-slate-200 p-3">
                <img src={t.assinatura} alt="assinatura" className="h-14 w-28 rounded border border-slate-100 bg-white object-contain" />
                <div className="text-sm"><div className="font-bold">{t.modelo}</div><div className="text-xs text-slate-500">{animalNome(t.animalId)} · {harasNome(t.harasId)} · {fmtBR(t.data)}</div></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
