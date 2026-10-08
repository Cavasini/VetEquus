import type { Agendamento, Animal, DB, Lancamento, Vacina, TipoVacina } from '../types/vet'
import { addDays, addMonths, todayISO, uid } from '../utils/date'

export const buildSeed = (): DB => {
  const hoje = todayISO()
  const d = (n: number) => addDays(hoje, n)

  const haras = [
    { id: 'h1', nome: 'Haras Primavera', responsavel: 'Carlos Eduardo Menezes', cpf: '123.456.789-09', telefone: '(11) 98765-4321', endereco: 'Estrada Rural km 12, Bragança Paulista - SP' },
    { id: 'h2', nome: 'Haras Vale Verde', responsavel: 'Mariana Albuquerque', cpf: '987.654.321-00', telefone: '(19) 99812-3344', endereco: 'Rod. Anhanguera km 98, Campinas - SP' },
    { id: 'h3', nome: 'Haras Santa Maria', responsavel: 'João Pedro Figueiredo', cpf: '456.123.789-55', telefone: '(35) 99100-2020', endereco: 'Fazenda Santa Maria, Cruzília - MG' },
  ]

  const A = (id: string, nome: string, categoria: Animal['categoria'], harasId: string, pelagem: string, status: Animal['status'], extra: Partial<Animal> = {}): Animal => ({
    id, nome, categoria, harasId, pelagem,
    sexo: categoria === 'Garanhão' ? 'Macho' : categoria === 'Potro' ? (extra.sexo ?? 'Macho') : 'Fêmea',
    chip: `9850001${id.replace(/\D/g, '').padStart(8, '0')}`,
    registro: `ABCCMM-${1000 + Number(id.replace(/\D/g, '') || 0) * 37}`,
    pai: 'Rei do Pampa', mae: 'Estrela Dalva',
    nascimento: addMonths(hoje, -(categoria === 'Potro' ? 7 : 72 + Number(id.replace(/\D/g, '') || 0) * 5)),
    status, diaPosOv: null, ...extra,
  })

  const animais: Animal[] = [
    A('a1', 'Estrela da Primavera', 'Doadora', 'h1', 'Castanha', 'Em ciclo', { diaPosOv: 8, pai: 'Imperador JM', mae: 'Aurora Dalva' }),
    A('a2', 'Aurora MM', 'Doadora', 'h1', 'Alazã', 'Em ciclo', { diaPosOv: 7 }),
    A('a3', 'Lua Cheia', 'Doadora', 'h2', 'Tordilha', 'Em ciclo', { diaPosOv: 9 }),
    A('a4', 'Safira', 'Doadora', 'h3', 'Preta', 'Em ciclo', { diaPosOv: null }),
    A('a5', 'Brisa do Vale', 'Doadora', 'h2', 'Baia', 'Descanso'),
    A('r1', 'Mimosa', 'Receptora', 'h1', 'Baia', 'Em ciclo', { diaPosOv: 5, edema: 1, clAtivo: true }),
    A('r2', 'Pérola', 'Receptora', 'h1', 'Tordilha', 'Em ciclo', { diaPosOv: 6, edema: 0, clAtivo: true }),
    A('r3', 'Boneca', 'Receptora', 'h1', 'Alazã', 'Em ciclo', { diaPosOv: 3, edema: 3, clAtivo: false }),
    A('r4', 'Jóia', 'Receptora', 'h2', 'Castanha', 'Em ciclo', { diaPosOv: 5, edema: 1, clAtivo: true }),
    A('r5', 'Chiquita', 'Receptora', 'h2', 'Pampa', 'Em ciclo', { diaPosOv: 6, edema: 2, clAtivo: true }),
    A('r6', 'Dama', 'Receptora', 'h3', 'Baia', 'Em ciclo', { diaPosOv: 5, edema: 0, clAtivo: true }),
    A('r7', 'Neblina', 'Receptora', 'h1', 'Tordilha', 'Prenha'),
    A('r8', 'Ninfa', 'Receptora', 'h3', 'Alazã', 'Vazia'),
    A('g1', 'Trovão do Sul', 'Garanhão', 'h1', 'Castanho', 'Ativo'),
    A('g2', 'Imperador JM', 'Garanhão', 'h2', 'Tordilho', 'Ativo'),
    A('g3', 'Zeus Mangalarga', 'Garanhão', 'h3', 'Alazão', 'Ativo'),
    A('p1', 'Faísca', 'Potro', 'h1', 'Alazã', 'Ativo', { sexo: 'Fêmea', pai: 'Trovão do Sul', mae: 'Mimosa' }),
    A('p2', 'Pequeno Príncipe', 'Potro', 'h2', 'Castanho', 'Ativo', { sexo: 'Macho', pai: 'Imperador JM', mae: 'Lua Cheia' }),
  ]

  const ag = (animalId: string, data: string, hora: string, subtipo: Agendamento['subtipo'], obs: string, automatico = false): Agendamento => {
    const harasId = animais.find((a) => a.id === animalId)!.harasId
    const tipo: Agendamento['tipo'] = subtipo === 'GERAL' ? 'Exame Clínico' : 'Reprodução'
    return { id: uid('ag'), data, hora, harasId, animalId, tipo, subtipo, obs, concluido: false, automatico }
  }

  const agenda: Agendamento[] = [
    ag('r7', hoje, '08:00', 'DG14', 'DG 14 dias pós-inovulação', true),
    ag('r4', hoje, '08:40', 'DG14', 'DG 14 dias pós-inovulação', true),
    ag('a1', hoje, '09:30', 'LAVAGEM', 'Lavagem D8 - garanhão Imperador JM'),
    ag('a3', hoje, '10:30', 'LAVAGEM', 'Lavagem D9 - garanhão Trovão do Sul'),
    ag('a4', hoje, '11:15', 'FOLICULAR', 'Controle folicular - estro'),
    ag('a2', hoje, '13:30', 'FOLICULAR', 'Controle folicular pós-Lutalyse (reavaliação 5 dias)', true),
    ag('r8', d(1), '09:00', 'DG30', 'DG 30 dias', true),
    ag('r1', d(2), '10:00', 'DG14', 'DG 14 dias pós-inovulação', true),
    ag('p1', d(2), '14:00', 'GERAL', 'Exame clínico do potro e pesagem'),
    ag('a5', d(4), '08:30', 'FOLICULAR', 'Reavaliação 5 dias pós-Lutalyse', true),
    ag('g1', d(6), '09:00', 'GERAL', 'Exame andrológico'),
    ag('r6', d(9), '10:00', 'DG45', 'DG 45 dias', true),
  ]
  agenda[8].tipo = 'Exame Clínico'
  agenda[10].tipo = 'Exame Clínico'
  agenda.push({ id: uid('ag'), data: d(3), hora: '11:00', harasId: 'h2', animalId: 'p2', tipo: 'Vacinação', subtipo: 'GERAL', obs: 'Reforço vacinal', concluido: false, automatico: false })
  agenda.push({ id: uid('ag'), data: d(5), hora: '15:00', harasId: 'h1', animalId: 'r3', tipo: 'Retorno de Medicação', subtipo: 'GERAL', obs: 'Retorno antibiótico - término do protocolo', concluido: false, automatico: false })

  const tiposVac: TipoVacina[] = ['Gripe', 'Tétano', 'Encefalomielite', 'Raiva', 'Rinopneumonite', 'Vermífugo']
  const vacinas: Vacina[] = []
  animais.forEach((a, i) => {
    tiposVac.forEach((t, j) => {
      const mesesAtras = (i * 3 + j * 5) % 11
      const aplicacao = addMonths(hoje, -mesesAtras)
      const ciclo = t === 'Vermífugo' ? 3 : t === 'Gripe' || t === 'Rinopneumonite' ? 6 : 12
      vacinas.push({ id: uid('vac'), animalId: a.id, tipo: t, aplicacao, vencimento: addMonths(aplicacao, ciclo) })
    })
  })

  const biometrias = [
    ...[0, 1, 2, 3, 4, 5, 6].map((m, i) => ({ id: uid('bio'), animalId: 'p1', data: addMonths(hoje, -6 + m), peso: [62, 118, 168, 212, 251, 283, 310][i] })),
    ...[0, 1, 2, 3, 4, 5, 6].map((m, i) => ({ id: uid('bio'), animalId: 'p2', data: addMonths(hoje, -6 + m), peso: [58, 110, 160, 198, 240, 270, 298][i] })),
    ...[0, 1, 2, 3].map((m, i) => ({ id: uid('bio'), animalId: 'a1', data: addMonths(hoje, -3 + m), peso: [480, 486, 493, 497][i] })),
    ...[0, 1, 2, 3].map((m, i) => ({ id: uid('bio'), animalId: 'g1', data: addMonths(hoje, -3 + m), peso: [545, 550, 548, 556][i] })),
  ]

  const consultas = [
    { id: uid('con'), animalId: 'r3', data: d(-4), temperatura: 38.9, fc: 52, fr: 22, tpc: 2, motilidade: 'Diminuída', queixa: 'Cólica leve, apatia', diagnostico: 'Compactação de cólon maior', prescricao: 'Flunixin meglumine 1,1 mg/kg IV SID por 3 dias; dieta hídrica.' },
    { id: uid('con'), animalId: 'p1', data: d(-10), temperatura: 37.8, fc: 44, fr: 18, tpc: 2, motilidade: 'Normal', queixa: 'Ferida em membro posterior', diagnostico: 'Laceração superficial', prescricao: 'Limpeza diária, pomada cicatrizante, vacina antitetânica reforço.' },
  ]

  const palhetas = [
    { id: 'pa1', garanhaoId: 'g1', lote: 'TS-2406', congelamento: addMonths(hoje, -14), motilidade: 45, vigor: 4, saldo: 38, canister: 1, rack: 1 },
    { id: 'pa2', garanhaoId: 'g1', lote: 'TS-2503', congelamento: addMonths(hoje, -6), motilidade: 52, vigor: 4, saldo: 24, canister: 1, rack: 2 },
    { id: 'pa3', garanhaoId: 'g2', lote: 'IJ-2410', congelamento: addMonths(hoje, -11), motilidade: 40, vigor: 3, saldo: 15, canister: 2, rack: 1 },
    { id: 'pa4', garanhaoId: 'g2', lote: 'IJ-2504', congelamento: addMonths(hoje, -5), motilidade: 48, vigor: 5, saldo: 30, canister: 3, rack: 2 },
    { id: 'pa5', garanhaoId: 'g3', lote: 'ZM-2501', congelamento: addMonths(hoje, -8), motilidade: 42, vigor: 3, saldo: 4, canister: 4, rack: 1 },
  ]

  const embrioes = [
    { id: 'e1', doadoraId: 'a3', garanhaoNome: 'Trovão do Sul', data: d(-1), grau: 'I' as const },
    { id: 'e2', doadoraId: 'a5', garanhaoNome: 'Imperador JM', data: d(-2), grau: 'II' as const },
  ]

  const L = (harasId: string, dias: number, descricao: string, qtd: number, valorUnit: number): Lancamento => ({ id: uid('lan'), harasId, data: d(dias), descricao, qtd, valorUnit })
  const lancamentos: Lancamento[] = [
    L('h1', -3, 'Visita clínica', 1, 250),
    L('h1', -3, 'Ultrassom reprodutivo', 8, 60),
    L('h1', -2, 'Lavagem uterina', 2, 450),
    L('h1', -1, 'Km rodado', 140, 3.5),
    L('h2', -4, 'Visita clínica', 1, 250),
    L('h2', -4, 'Diária de tronco', 5, 80),
    L('h2', -2, 'Lavagem uterina', 1, 450),
    L('h2', -2, 'Km rodado', 220, 3.5),
    L('h3', -5, 'Visita clínica', 1, 250),
    L('h3', -5, 'Ultrassom reprodutivo', 4, 60),
    L('h3', -1, 'Km rodado', 480, 3.5),
  ]

  const midias = [
    { id: uid('mid'), animalId: 'r7', titulo: 'US gestação 30 dias', tipo: 'Ultrassom' as const, data: d(-12) },
    { id: uid('mid'), animalId: 'a1', titulo: 'US ovário direito - folículo 38mm', tipo: 'Ultrassom' as const, data: d(-9) },
    { id: uid('mid'), animalId: 'p1', titulo: 'Ferida membro posterior - D0', tipo: 'Ferida' as const, data: d(-10) },
    { id: uid('mid'), animalId: 'p1', titulo: 'Ferida membro posterior - D7', tipo: 'Ferida' as const, data: d(-3) },
    { id: uid('mid'), animalId: 'r3', titulo: 'Hemograma completo', tipo: 'Exame' as const, data: d(-4) },
    { id: uid('mid'), animalId: 'g1', titulo: 'US testicular', tipo: 'Ultrassom' as const, data: d(-20) },
  ]

  return {
    haras, animais, biometrias, vacinas, consultas, agenda,
    foliculares: [
      { id: uid('fol'), animalId: 'a4', data: d(-2), ovD: 28, ovE: 22, edema: 2, tonus: 'Médio', cl: 'Ausente', obs: 'Folículo em crescimento' },
    ],
    inducoes: [
      { id: uid('ind'), animalId: 'a1', droga: 'Deslorelina', inducaoEm: `${d(-20)}T08:00`, ovulacaoEm: `${d(-18)}T14:00`, horas: 38 },
      { id: uid('ind'), animalId: 'a1', droga: 'hCG', inducaoEm: `${d(-45)}T09:00`, ovulacaoEm: `${d(-43)}T09:00`, horas: 48 },
      { id: uid('ind'), animalId: 'a1', droga: 'Deslorelina', inducaoEm: `${d(-70)}T08:30`, ovulacaoEm: `${d(-68)}T08:30`, horas: 48 },
    ],
    palhetas, embrioes, termos: [], lancamentos, faturas: [], midias,
  }
}
