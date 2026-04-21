export type PlanStatus = 'Ativo' | 'Inativo' | 'Vencido' | 'Sem Plano'
export type PlanType = '3 meses' | '4 meses' | '6 meses' | ''

export interface ProfissionalSessao {
  id: string
  profissional: string
  tipoSessao: string
  valorSessao: number
  frequencia: string
  totalSessoesCalculado: number
}

export interface Patient {
  id: string
  name: string
  birthDate: string
  phone?: string
  email?: string
  address?: string
  plan: PlanType
  status: PlanStatus
  startDate?: string
  endDate?: string
  planId?: string
}
