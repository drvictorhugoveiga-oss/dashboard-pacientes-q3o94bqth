import { z } from 'zod'

export const patientSchema = z.object({
  name: z.string().min(3, { message: 'Nome deve ter no mínimo 3 caracteres' }),
  birthDate: z.string().min(1, { message: 'Data de nascimento é obrigatória' }),
  plan: z.enum(['3 meses', '4 meses', '6 meses', 'Sem plano'], {
    required_error: 'Selecione um plano',
  }),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(['Ativo', 'Inativo', 'Vencido'], {
    required_error: 'Status é obrigatório',
  }),
})

export type PatientFormValues = z.infer<typeof patientSchema>
