import { z } from 'zod'

export const patientSchema = z.object({
  name: z.string().min(3, { message: 'Nome deve ter no mínimo 3 caracteres' }),
  birthDate: z.string().min(1, { message: 'Data de nascimento é obrigatória' }),
  phone: z.string().min(10, { message: 'Telefone é obrigatório' }),
  email: z.string().email({ message: 'Email inválido' }).or(z.literal('')),
  address: z.string().optional(),
  vivaPlanId: z.string().optional().or(z.literal('')),
  vivaStartDate: z.string().optional().or(z.literal('')),
  vivaEndDate: z.string().optional().or(z.literal('')),
  vivaStatus: z.enum(['Ativo', 'Inativo', 'Vencido']).optional(),
})

export type PatientFormValues = z.infer<typeof patientSchema>
