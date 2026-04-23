export interface SessaoFiltersState {
  profissional: string
  periodo: string
  status: string
  startDate?: string
  endDate?: string
}

export interface Sessao {
  id: string
  data_sessao: string
  paciente: string
  plano: string
  profissional: string
  tipo_sessao: string
  valor_sessao: number
  status: 'Realizada' | 'Cancelada' | 'Pendente'
  motivo_cancelamento?: string
  expand?: {
    paciente?: { id: string; nome: string }
    plano?: { id: string; tipo_plano: string }
  }
}
