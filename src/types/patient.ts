export type VivaPlanStatus = 'Ativo' | 'Inativo' | 'Vencido' | 'Sem Plano'

export interface Patient {
  id: string
  name: string
  birthDate: string
  phone?: string
  email?: string
  address?: string
  vivaPlanId?: string
  vivaPlanName?: string
  vivaStatus: VivaPlanStatus
  vivaStartDate?: string
  vivaEndDate?: string
}
