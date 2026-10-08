import { MessageCircle, Printer } from 'lucide-react'
import { useVet } from '../../context/VetContext'
import type { Fatura } from '../../types/vet'
import { brl, fmtBR } from '../../utils/date'
import { Modal } from '../common/ui'

export default function FechamentoMesModal({ fatura, onClose }: { fatura: Fatura; onClose: () => void }) {
  const { db } = useVet()
  const haras = db.haras.find((h) => h.id === fatura.harasId)!

  const texto = [
    `*Fatura VetEquus — ${haras.nome}*`,
    `Referência: ${fatura.mes.split('-').reverse().join('/')}`,
    '',
    ...fatura.itens.map((i) => `• ${i.descricao} — ${i.qtd} x ${brl(i.valorUnit)} = ${brl(i.qtd * i.valorUnit)}`),
    '',
    `*Total: ${brl(fatura.total)}*`,
  ].join('\n')
  const fone = haras.telefone.replace(/\D/g, '')
  const link = `https://wa.me/55${fone}?text=${encodeURIComponent(texto)}`

  return (
    <Modal
      title="Fatura Consolidada"
      onClose={onClose}
      wide
      footer={
        <>
          <button className="btn-secondary" onClick={() => window.print()}><Printer size={16} /> Imprimir / Salvar PDF</button>
          <a className="btn-success" href={link} target="_blank" rel="noreferrer"><MessageCircle size={16} /> Enviar via WhatsApp</a>
        </>
      }
    >
      <div className="print-area rounded-xl bg-white p-2">
        <div className="mb-4 flex justify-between border-b border-slate-200 pb-3">
          <div><div className="text-xl font-extrabold">VetEquus</div><div className="text-xs text-slate-500">Gestão clínica e reprodução equina</div></div>
          <div className="text-right text-sm"><div className="font-bold">Fatura Nº {fatura.id.slice(-6).toUpperCase()}</div><div className="text-slate-500">Emissão {fmtBR(fatura.data)}</div></div>
        </div>
        <div className="mb-4 text-sm"><b>{haras.nome}</b><br />{haras.responsavel} · CPF {haras.cpf}<br />{haras.endereco}</div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="px-3 py-2">Data</th><th>Descrição</th><th className="text-right">Qtd</th><th className="text-right">Unit.</th><th className="px-3 text-right">Total</th></tr></thead>
          <tbody>
            {fatura.itens.map((i) => (
              <tr key={i.id} className="border-t border-slate-100"><td className="px-3 py-2">{fmtBR(i.data)}</td><td>{i.descricao}</td><td className="text-right">{i.qtd}</td><td className="text-right">{brl(i.valorUnit)}</td><td className="px-3 text-right font-semibold">{brl(i.qtd * i.valorUnit)}</td></tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 text-right text-xl font-extrabold">Total: {brl(fatura.total)}</div>
      </div>
    </Modal>
  )
}
