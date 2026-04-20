export type PlanType = '3 meses' | '4 meses' | '6 meses' | 'Sem plano'
export type PatientStatus = 'Ativo' | 'Inativo' | 'Vencido'

export interface Patient {
  id: string
  name: string
  birthDate: string // YYYY-MM-DD
  plan: PlanType
  startDate: string // YYYY-MM-DD
  endDate: string // YYYY-MM-DD
  status: PatientStatus
}
