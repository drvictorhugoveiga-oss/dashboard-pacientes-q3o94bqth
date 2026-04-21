import { z } from 'zod'

export const professionalSchema = z.object({
  profissional: z.enum(
    ['Médico', 'Nutricionista', 'Enfermeira', 'Fonoaudióloga', 'Psicóloga', 'Fisioterapeuta'],
    { required_error: 'Selecione o profissional' },
  ),
  tipoSessao: z.enum(['Consulta', 'Avaliação', 'Acompanhamento', 'Retorno'], {
    required_error: 'Selecione o tipo',
  }),
  valorSessao: z.coerce
    .number({ invalid_type_error: 'Valor inválido' })
    .min(0, 'O valor deve ser maior ou igual a 0'),
  frequencia: z.enum(['Semanal', 'Quinzenal', 'Mensal', 'Conforme demanda'], {
    required_error: 'Selecione a frequência',
  }),
})

export const patientSchema = z
  .object({
    name: z.string().min(3, { message: 'Nome deve ter no mínimo 3 caracteres' }),
    birthDate: z.string().min(1, { message: 'Data de nascimento é obrigatória' }),
    phone: z.string().min(10, { message: 'Telefone é obrigatório' }),
    email: z.string().email({ message: 'Email inválido' }).or(z.literal('')),
    address: z.string().optional(),
    plan: z.enum(['3 meses', '4 meses', '6 meses', 'Sem plano'], {
      required_error: 'Selecione um plano',
    }),
    startDate: z.string().min(1, { message: 'Data de início é obrigatória' }),
    endDate: z.string().optional(),
    status: z.enum(['Ativo', 'Inativo', 'Vencido'], {
      required_error: 'Status é obrigatório',
    }),
    professionals: z.array(professionalSchema).default([]),
  })
  .refine(
    (data) => {
      if (data.plan === 'Sem plano') return true
      if (!data.startDate || !data.endDate) return true
      return new Date(data.endDate) > new Date(data.startDate)
    },
    {
      message: 'Data de término deve ser posterior à data de início',
      path: ['endDate'],
    },
  )

export type PatientFormValues = z.infer<typeof patientSchema>
export type ProfessionalFormValues = z.infer<typeof professionalSchema>
