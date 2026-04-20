import pb from '@/lib/pocketbase/client'
import { Patient } from '@/types/patient'

export const getPacientes = async (): Promise<Patient[]> => {
  const records = await pb.collection('pacientes').getFullList({
    sort: '-created',
  })

  const planos = await pb.collection('planos_skip').getFullList()

  return records.map((r) => {
    const plano = planos.find((p) => p.paciente === r.id)
    return {
      id: r.id,
      name: r.nome,
      birthDate: r.data_nascimento || '',
      phone: r.telefone || '',
      email: r.email || '',
      address: r.endereco || '',
      plan: plano?.tipo_plano || '',
      status: plano?.status || 'Sem Plano',
      startDate: plano?.data_inicio || '',
      endDate: plano?.data_termino || '',
      planId: plano?.id,
    } as Patient
  })
}
