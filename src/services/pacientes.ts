import pb from '@/lib/pocketbase/client'
import { Patient } from '@/types/patient'

import { PatientFormValues } from '@/schemas/patient-schema'

export const getPacienteCompleto = async (id: string) => {
  const paciente = await pb.collection('pacientes').getOne(id)
  const planos = await pb.collection('planos_skip').getFullList({
    filter: `paciente = "${id}"`,
  })
  const plano = planos[0]
  let profissionais: any[] = []
  if (plano) {
    profissionais = await pb.collection('profissionais_sessoes').getFullList({
      filter: `plano = "${plano.id}"`,
    })
  }
  return { paciente, plano, profissionais }
}

export const updatePacienteCompleto = async (
  id: string,
  data: PatientFormValues,
  userId: string,
  totalMargin: number,
) => {
  const paciente = await pb.collection('pacientes').update(id, {
    nome: data.name,
    data_nascimento: data.birthDate
      ? new Date(data.birthDate + 'T12:00:00.000Z').toISOString()
      : '',
    telefone: data.phone,
    email: data.email || '',
    endereco: data.address || '',
  })

  const planos = await pb.collection('planos_skip').getFullList({
    filter: `paciente = "${id}"`,
  })
  let plano = planos[0]

  if (data.plan !== 'Sem plano') {
    const planoData = {
      tipo_plano: data.plan,
      data_inicio: data.startDate ? new Date(data.startDate + 'T12:00:00.000Z').toISOString() : '',
      data_termino: data.endDate ? new Date(data.endDate + 'T12:00:00.000Z').toISOString() : '',
      status: data.status,
      margem_total: totalMargin,
    }

    if (plano) {
      plano = await pb.collection('planos_skip').update(plano.id, planoData)
    } else {
      plano = await pb.collection('planos_skip').create({
        ...planoData,
        user: userId,
        paciente: id,
      })
    }

    // Remover profissionais antigos
    const oldProfs = await pb.collection('profissionais_sessoes').getFullList({
      filter: `plano = "${plano.id}"`,
    })
    await Promise.all(oldProfs.map((p) => pb.collection('profissionais_sessoes').delete(p.id)))

    const months = parseInt(data.plan.charAt(0)) || 0

    // Adicionar novos profissionais
    await Promise.all(
      data.professionals.map(async (prof) => {
        let sessions = 0
        if (prof.frequencia === 'Semanal') sessions = 4 * months
        else if (prof.frequencia === 'Quinzenal') sessions = 2 * months
        else if (prof.frequencia === 'Mensal') sessions = 1 * months
        else if (prof.frequencia === 'Conforme demanda') sessions = 1

        return pb.collection('profissionais_sessoes').create({
          user: userId,
          plano: plano.id,
          profissional: prof.profissional,
          tipo_sessao: prof.tipoSessao,
          valor_sessao: prof.valorSessao,
          frequencia: prof.frequencia,
          total_sessoes_calculado: sessions,
        })
      }),
    )
  } else if (plano) {
    const oldProfs = await pb.collection('profissionais_sessoes').getFullList({
      filter: `plano = "${plano.id}"`,
    })
    await Promise.all(oldProfs.map((p) => pb.collection('profissionais_sessoes').delete(p.id)))
    await pb.collection('planos_skip').delete(plano.id)
  }

  return paciente
}

export const createPacienteCompleto = async (
  data: PatientFormValues,
  userId: string,
  totalMargin: number,
) => {
  const paciente = await pb.collection('pacientes').create({
    user: userId,
    nome: data.name,
    data_nascimento: data.birthDate
      ? new Date(data.birthDate + 'T12:00:00.000Z').toISOString()
      : '',
    telefone: data.phone,
    email: data.email || '',
    endereco: data.address || '',
  })

  if (data.plan !== 'Sem plano') {
    const plano = await pb.collection('planos_skip').create({
      user: userId,
      paciente: paciente.id,
      tipo_plano: data.plan,
      data_inicio: data.startDate ? new Date(data.startDate + 'T12:00:00.000Z').toISOString() : '',
      data_termino: data.endDate ? new Date(data.endDate + 'T12:00:00.000Z').toISOString() : '',
      status: data.status,
      margem_total: totalMargin,
    })

    const months = parseInt(data.plan.charAt(0)) || 0

    for (const prof of data.professionals) {
      let sessions = 0
      if (prof.frequencia === 'Semanal') sessions = 4 * months
      else if (prof.frequencia === 'Quinzenal') sessions = 2 * months
      else if (prof.frequencia === 'Mensal') sessions = 1 * months
      else if (prof.frequencia === 'Conforme demanda') sessions = 1

      await pb.collection('profissionais_sessoes').create({
        user: userId,
        plano: plano.id,
        profissional: prof.profissional,
        tipo_sessao: prof.tipoSessao,
        valor_sessao: prof.valorSessao,
        frequencia: prof.frequencia,
        total_sessoes_calculado: sessions,
      })
    }
  }
  return paciente
}

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
