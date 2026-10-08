export type Categoria = 'Doadora' | 'Receptora' | 'Garanhão' | 'Potro'
export type StatusRepro = 'Em ciclo' | 'Prenha' | 'Vazia' | 'Descanso' | 'Ativo'
export type TabId = 'inicio' | 'agenda' | 'animais' | 'reproducao' | 'clinica' | 'financeiro'

export interface Haras {
  id: string
  nome: string
  responsavel: string
  cpf: string
  telefone: string
  endereco: string
}

export interface Animal {
  id: string
  nome: string
  categoria: Categoria
  harasId: string
  pelagem: string
  sexo: 'Fêmea' | 'Macho'
  chip: string
  registro: string
  pai: string
  mae: string
  nascimento: string
  status: StatusRepro
  /** Dias pós-ovulação (doadora/receptora) */
  diaPosOv?: number | null
  /** Receptora: edema 0-4 e CL ativo */
  edema?: number
  clAtivo?: boolean
  /** Receptora: id do embrião inovulado */
  prenhezDe?: string
}

export interface Biometria {
  id: string
  animalId: string
  data: string
  peso: number
}

export type TipoVacina = 'Gripe' | 'Tétano' | 'Encefalomielite' | 'Raiva' | 'Rinopneumonite' | 'Vermífugo'

export interface Vacina {
  id: string
  animalId: string
  tipo: TipoVacina
  aplicacao: string
  vencimento: string
}

export interface Consulta {
  id: string
  animalId: string
  data: string
  temperatura: number
  fc: number
  fr: number
  tpc: number
  motilidade: string
  queixa: string
  diagnostico: string
  prescricao: string
}

export type SubtipoAgenda =
  | 'DG14'
  | 'DG30'
  | 'DG45'
  | 'DG60'
  | 'LAVAGEM'
  | 'FOLICULAR'
  | 'GERAL'

export type TipoAgenda = 'Reprodução' | 'Exame Clínico' | 'Vacinação' | 'Retorno de Medicação'

export interface Agendamento {
  id: string
  data: string
  hora: string
  harasId: string
  animalId: string
  tipo: TipoAgenda
  subtipo: SubtipoAgenda
  obs: string
  concluido: boolean
  automatico: boolean
}

export interface Folicular {
  id: string
  animalId: string
  data: string
  ovD: number
  ovE: number
  edema: number
  tonus: 'Flácido' | 'Médio' | 'Tônico'
  cl: 'Ausente' | 'Cavitário' | 'Compacto'
  obs: string
}

export interface Inducao {
  id: string
  animalId: string
  droga: 'hCG' | 'Deslorelina'
  inducaoEm: string
  ovulacaoEm: string
  horas: number
}

export interface Palheta {
  id: string
  garanhaoId: string
  lote: string
  congelamento: string
  motilidade: number
  vigor: number
  saldo: number
  canister: number
  rack: number
}

export interface Embriao {
  id: string
  doadoraId: string
  garanhaoNome: string
  data: string
  grau: 'I' | 'II' | 'III'
  receptoraId?: string
  inovuladoEm?: string
}

export interface Termo {
  id: string
  modelo: string
  harasId: string
  animalId: string
  data: string
  assinatura: string
}

export interface Lancamento {
  id: string
  harasId: string
  data: string
  descricao: string
  qtd: number
  valorUnit: number
  faturaId?: string
}

export interface Fatura {
  id: string
  harasId: string
  mes: string
  data: string
  total: number
  itens: Lancamento[]
}

export interface Midia {
  id: string
  animalId: string
  titulo: string
  tipo: 'Ultrassom' | 'Ferida' | 'Exame'
  data: string
}

export interface DB {
  haras: Haras[]
  animais: Animal[]
  biometrias: Biometria[]
  vacinas: Vacina[]
  consultas: Consulta[]
  agenda: Agendamento[]
  foliculares: Folicular[]
  inducoes: Inducao[]
  palhetas: Palheta[]
  embrioes: Embriao[]
  termos: Termo[]
  lancamentos: Lancamento[]
  faturas: Fatura[]
  midias: Midia[]
}
