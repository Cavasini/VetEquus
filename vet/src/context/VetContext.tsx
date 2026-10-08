import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type {
  Agendamento, Animal, Consulta, DB, Embriao, Folicular, Inducao, Lancamento, SubtipoAgenda,
  TabId, TipoVacina, Termo, Fatura,
} from '../types/vet'
import { buildSeed } from '../data/mockData'
import { addDays, addMonths, fmtBR, todayISO, uid } from '../utils/date'

const KEY = 'vetequus_db_v1'

export interface TriggerPrompt {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
}

export interface ToastMsg {
  id: string
  text: string
  kind: 'success' | 'info' | 'error'
}

export type DGResultado = 'Positivo' | 'Negativo' | 'Reavaliar'

interface Ctx {
  db: DB
  tab: TabId
  setTab: (t: TabId) => void
  harasFiltro: string
  setHarasFiltro: (id: string) => void
  /** Dados já filtrados pelo haras ativo */
  animaisF: Animal[]
  agendaF: Agendamento[]
  toasts: ToastMsg[]
  dismissToast: (id: string) => void
  toast: (text: string, kind?: ToastMsg['kind']) => void
  trigger: TriggerPrompt | null
  askTrigger: (t: TriggerPrompt) => void
  closeTrigger: () => void
  novoRegistroOpen: boolean
  setNovoRegistroOpen: (v: boolean) => void
  harasNome: (id: string) => string
  animalNome: (id: string) => string
  addAnimal: (a: Omit<Animal, 'id'>) => void
  addAgendamento: (a: Omit<Agendamento, 'id' | 'concluido' | 'automatico'> & { automatico?: boolean }) => void
  removerAgendamento: (id: string) => void
  concluirAgendamento: (id: string) => void
  registrarDG: (ag: Agendamento, r: DGResultado) => void
  registrarLavagem: (ag: Agendamento, v: { positiva: boolean; embrioes: number; grau: Embriao['grau']; garanhao: string }) => void
  registrarFolicular: (f: Omit<Folicular, 'id'>, agId?: string, ovulou?: boolean) => void
  realizarMatch: (embriaoId: string, receptoraId: string) => void
  baixaPalheta: (id: string, qtd: number) => void
  registrarVacina: (animalId: string, tipo: TipoVacina) => void
  addConsulta: (c: Omit<Consulta, 'id'>) => void
  addBiometria: (animalId: string, peso: number, data: string) => void
  addInducao: (i: Omit<Inducao, 'id'>) => void
  salvarTermo: (t: Omit<Termo, 'id'>) => void
  addLancamento: (l: Omit<Lancamento, 'id'>) => void
  fecharMes: (harasId: string) => Fatura | null
  resetDemo: () => void
}

const VetContext = createContext<Ctx | null>(null)

const load = (): DB => {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as DB
  } catch { /* ignora */ }
  return buildSeed()
}

export function VetProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<DB>(load)
  const [tab, setTab] = useState<TabId>('inicio')
  const [harasFiltro, setHarasFiltro] = useState('todos')
  const [toasts, setToasts] = useState<ToastMsg[]>([])
  const [trigger, setTrigger] = useState<TriggerPrompt | null>(null)
  const [novoRegistroOpen, setNovoRegistroOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(db))
  }, [db])

  const dismissToast = useCallback((id: string) => setToasts((t) => t.filter((x) => x.id !== id)), [])
  const toast = useCallback((text: string, kind: ToastMsg['kind'] = 'success') => {
    const id = uid('t')
    setToasts((t) => [...t, { id, text, kind }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200)
  }, [])
  const askTrigger = useCallback((t: TriggerPrompt) => setTrigger(t), [])
  const closeTrigger = useCallback(() => setTrigger(null), [])

  const harasNome = (id: string) => db.haras.find((h) => h.id === id)?.nome ?? '-'
  const animalNome = (id: string) => db.animais.find((a) => a.id === id)?.nome ?? '-'

  const animaisF = useMemo(
    () => db.animais.filter((a) => harasFiltro === 'todos' || a.harasId === harasFiltro),
    [db.animais, harasFiltro],
  )
  const agendaF = useMemo(
    () => db.agenda.filter((a) => harasFiltro === 'todos' || a.harasId === harasFiltro),
    [db.agenda, harasFiltro],
  )

  const patch = (p: Partial<DB>) => setDb((d) => ({ ...d, ...p }))
  const updAnimal = (id: string, p: Partial<Animal>) =>
    setDb((d) => ({ ...d, animais: d.animais.map((a) => (a.id === id ? { ...a, ...p } : a)) }))

  const addAnimal: Ctx['addAnimal'] = (a) => {
    setDb((d) => ({ ...d, animais: [...d.animais, { ...a, id: uid('an') }] }))
    toast(`Animal ${a.nome} cadastrado com sucesso`)
  }

  const criarAgenda = (animalId: string, dias: number, subtipo: SubtipoAgenda, obs: string, hora = '08:00') => {
    const animal = db.animais.find((a) => a.id === animalId)
    if (!animal) return
    const novo: Agendamento = {
      id: uid('ag'), data: addDays(todayISO(), dias), hora, harasId: animal.harasId, animalId,
      tipo: subtipo === 'GERAL' ? 'Exame Clínico' : 'Reprodução', subtipo, obs, concluido: false, automatico: true,
    }
    setDb((d) => ({ ...d, agenda: [...d.agenda, novo] }))
    return novo
  }

  const addAgendamento: Ctx['addAgendamento'] = (a) => {
    setDb((d) => ({ ...d, agenda: [...d.agenda, { ...a, id: uid('ag'), concluido: false, automatico: a.automatico ?? false }] }))
    toast('Agendamento criado')
  }
  const removerAgendamento = (id: string) => {
    setDb((d) => ({ ...d, agenda: d.agenda.filter((a) => a.id !== id) }))
    toast('Agendamento removido', 'info')
  }
  const concluirAgendamento = (id: string) =>
    setDb((d) => ({ ...d, agenda: d.agenda.map((a) => (a.id === id ? { ...a, concluido: true } : a)) }))

  const registrarDG: Ctx['registrarDG'] = (ag, r) => {
    const nome = animalNome(ag.animalId)
    if (r === 'Reavaliar') {
      concluirAgendamento(ag.id)
      criarAgenda(ag.animalId, 3, ag.subtipo, `Reavaliação de ${ag.subtipo} (resultado inconclusivo)`)
      toast(`${nome}: reavaliação agendada em 3 dias`, 'info')
      return
    }
    concluirAgendamento(ag.id)
    if (r === 'Negativo') {
      updAnimal(ag.animalId, { status: 'Vazia', diaPosOv: null, prenhezDe: undefined })
      toast(`${nome}: ${ag.subtipo} NEGATIVO — receptora liberada`, 'info')
      return
    }
    updAnimal(ag.animalId, { status: 'Prenha' })
    toast(`${nome}: ${ag.subtipo} POSITIVO ✔`)
    if (ag.subtipo === 'DG14') {
      askTrigger({
        title: 'Agendar DG30?',
        message: `${nome} está positiva no DG14. Deseja agendar o DG30 (em 16 dias, ${fmtBR(addDays(todayISO(), 16))})?`,
        confirmLabel: 'Sim, agendar DG30',
        onConfirm: () => { criarAgenda(ag.animalId, 16, 'DG30', 'DG 30 dias'); toast('DG30 agendado') },
      })
    } else if (ag.subtipo === 'DG30') {
      askTrigger({
        title: 'Agendar DG45 / DG60?',
        message: `${nome} está positiva no DG30. Deseja agendar o DG45 (+15 dias) e o DG60 (+30 dias)?`,
        confirmLabel: 'Sim, agendar ambos',
        onConfirm: () => {
          criarAgenda(ag.animalId, 15, 'DG45', 'DG 45 dias')
          criarAgenda(ag.animalId, 30, 'DG60', 'DG 60 dias')
          toast('DG45 e DG60 agendados')
        },
      })
    } else if (ag.subtipo === 'DG45') {
      askTrigger({
        title: 'Agendar DG60?',
        message: `Deseja agendar o DG60 para ${nome} em 15 dias?`,
        confirmLabel: 'Sim, agendar DG60',
        onConfirm: () => { criarAgenda(ag.animalId, 15, 'DG60', 'DG 60 dias'); toast('DG60 agendado') },
      })
    }
  }

  const registrarLavagem: Ctx['registrarLavagem'] = (ag, v) => {
    concluirAgendamento(ag.id)
    if (v.positiva && v.embrioes > 0) {
      const novos: Embriao[] = Array.from({ length: v.embrioes }, () => ({
        id: uid('emb'), doadoraId: ag.animalId, garanhaoNome: v.garanhao, data: todayISO(), grau: v.grau,
      }))
      setDb((d) => ({ ...d, embrioes: [...d.embrioes, ...novos] }))
      toast(`Lavagem positiva: ${v.embrioes} embrião(ões) grau ${v.grau} disponível(is) para TE`)
    } else {
      toast('Lavagem negativa registrada', 'info')
    }
    updAnimal(ag.animalId, { diaPosOv: null, status: 'Descanso' })
  }

  const registrarFolicular: Ctx['registrarFolicular'] = (f, agId, ovulou) => {
    setDb((d) => ({ ...d, foliculares: [...d.foliculares, { ...f, id: uid('fol') }] }))
    if (agId) concluirAgendamento(agId)
    toast('Controle folicular registrado')
    if (ovulou) {
      updAnimal(f.animalId, { diaPosOv: 0 })
      askTrigger({
        title: 'Agendar DG14?',
        message: `Ovulação de ${animalNome(f.animalId)} registrada. Deseja agendar o DG14 (em 14 dias)?`,
        confirmLabel: 'Sim, agendar DG14',
        onConfirm: () => { criarAgenda(f.animalId, 14, 'DG14', 'DG 14 dias pós-ovulação'); toast('DG14 agendado') },
      })
    }
  }

  const realizarMatch: Ctx['realizarMatch'] = (embriaoId, receptoraId) => {
    setDb((d) => ({
      ...d,
      embrioes: d.embrioes.map((e) => (e.id === embriaoId ? { ...e, receptoraId, inovuladoEm: todayISO() } : e)),
      animais: d.animais.map((a) =>
        a.id === receptoraId ? { ...a, status: 'Prenha', prenhezDe: embriaoId } : a),
    }))
    criarAgenda(receptoraId, 14, 'DG14', 'DG 14 dias pós-inovulação (TE)')
    toast(`Inovulação realizada em ${animalNome(receptoraId)} — DG14 agendado automaticamente`)
  }

  const baixaPalheta = (id: string, qtd: number) => {
    setDb((d) => ({ ...d, palhetas: d.palhetas.map((p) => (p.id === id ? { ...p, saldo: Math.max(0, p.saldo - qtd) } : p)) }))
    toast(`Baixa de ${qtd} palheta(s) registrada`)
  }

  const registrarVacina = (animalId: string, tipo: TipoVacina) => {
    const hoje = todayISO()
    const meses = tipo === 'Vermífugo' ? 3 : tipo === 'Gripe' || tipo === 'Rinopneumonite' ? 6 : 12
    setDb((d) => ({
      ...d,
      vacinas: d.vacinas.some((v) => v.animalId === animalId && v.tipo === tipo)
        ? d.vacinas.map((v) => (v.animalId === animalId && v.tipo === tipo ? { ...v, aplicacao: hoje, vencimento: addMonths(hoje, meses) } : v))
        : [...d.vacinas, { id: uid('vac'), animalId, tipo, aplicacao: hoje, vencimento: addMonths(hoje, meses) }],
    }))
    toast(`${tipo} aplicada — próximo vencimento ${fmtBR(addMonths(hoje, meses))}`)
  }

  const addConsulta: Ctx['addConsulta'] = (c) => {
    setDb((d) => ({ ...d, consultas: [{ ...c, id: uid('con') }, ...d.consultas] }))
    toast('Consulta registrada')
    if (/lutalyse|sincrocio|prostaglandina|cloprostenol|d-cloprostenol/i.test(c.prescricao)) {
      askTrigger({
        title: 'Reavaliação folicular em 5 dias?',
        message: `Prostaglandina detectada na prescrição de ${animalNome(c.animalId)}. Deseja agendar a reavaliação folicular em 5 dias (${fmtBR(addDays(todayISO(), 5))})?`,
        confirmLabel: 'Sim, agendar',
        onConfirm: () => { criarAgenda(c.animalId, 5, 'FOLICULAR', 'Reavaliação 5 dias pós-Lutalyse'); toast('Reavaliação folicular agendada') },
      })
    }
  }

  const addBiometria = (animalId: string, peso: number, data: string) => {
    setDb((d) => ({ ...d, biometrias: [...d.biometrias, { id: uid('bio'), animalId, peso, data }] }))
    toast('Peso registrado')
  }
  const addInducao: Ctx['addInducao'] = (i) => {
    setDb((d) => ({ ...d, inducoes: [...d.inducoes, { ...i, id: uid('ind') }] }))
    toast(`Resposta à indução: ${i.horas} h`)
  }
  const salvarTermo: Ctx['salvarTermo'] = (t) => {
    setDb((d) => ({ ...d, termos: [{ ...t, id: uid('ter') }, ...d.termos] }))
    toast('Termo assinado e salvo')
  }
  const addLancamento: Ctx['addLancamento'] = (l) => {
    setDb((d) => ({ ...d, lancamentos: [...d.lancamentos, { ...l, id: uid('lan') }] }))
    toast('Lançamento adicionado')
  }

  const fecharMes: Ctx['fecharMes'] = (harasId) => {
    const itens = db.lancamentos.filter((l) => l.harasId === harasId && !l.faturaId)
    if (!itens.length) { toast('Sem lançamentos em aberto para este haras', 'error'); return null }
    const fat: Fatura = {
      id: uid('fat'), harasId, data: todayISO(), mes: todayISO().slice(0, 7),
      total: itens.reduce((s, l) => s + l.qtd * l.valorUnit, 0), itens,
    }
    setDb((d) => ({
      ...d,
      faturas: [fat, ...d.faturas],
      lancamentos: d.lancamentos.map((l) => (itens.some((i) => i.id === l.id) ? { ...l, faturaId: fat.id } : l)),
    }))
    toast('Fatura gerada com sucesso')
    return fat
  }

  const resetDemo = () => {
    localStorage.removeItem(KEY)
    patch(buildSeed())
    toast('Dados da demo restaurados', 'info')
  }

  const value: Ctx = {
    db, tab, setTab, harasFiltro, setHarasFiltro, animaisF, agendaF, toasts, dismissToast, toast,
    trigger, askTrigger, closeTrigger, novoRegistroOpen, setNovoRegistroOpen, harasNome, animalNome,
    addAnimal, addAgendamento, removerAgendamento, concluirAgendamento, registrarDG, registrarLavagem,
    registrarFolicular, realizarMatch, baixaPalheta, registrarVacina, addConsulta, addBiometria,
    addInducao, salvarTermo, addLancamento, fecharMes, resetDemo,
  }
  return <VetContext.Provider value={value}>{children}</VetContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useVet() {
  const c = useContext(VetContext)
  if (!c) throw new Error('useVet fora do VetProvider')
  return c
}
