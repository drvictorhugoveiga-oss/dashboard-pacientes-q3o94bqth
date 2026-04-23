import pb from '@/lib/pocketbase/client'

export const getPacientes = () => pb.collection('pacientes').getFullList({ sort: 'nome' })

export const deletePaciente = (id: string) => pb.collection('pacientes').delete(id)

export const getPacienteCompleto = async (id: string) => {
  const paciente = await pb.collection('pacientes').getOne(id)
  let plano = null
  let profissionais = []
  try {
    plano = await pb
      .collection('planos_skip')
      .getFirstListItem(`paciente="${id}"`, { sort: '-created' })
    if (plano) {
      profissionais = await pb
        .collection('profissionais_sessoes')
        .getFullList({ filter: `plano="${plano.id}"` })
    }
  } catch (e) {
    // Ignorar se não tiver plano
  }
  return { paciente, plano, profissionais }
}

export const createPacienteCompleto = async (data: any, userId: string, totalMargin: number) => {
  const paciente = await pb.collection('pacientes').create({
    user: userId,
    nome: data.name,
    data_nascimento: data.birthDate,
    telefone: data.phone,
    email: data.email,
    endereco: data.address,
  })

  let planoId = null
  if (data.plan !== 'Sem plano') {
    const plano = await pb.collection('planos_skip').create({
      user: userId,
      paciente: paciente.id,
      tipo_plano: data.plan,
      data_inicio: data.startDate,
      data_termino: data.endDate || null,
      status: data.status,
      margem_total: totalMargin,
    })
    planoId = plano.id
  }

  if (planoId) {
    for (const prof of data.professionals) {
      let sessoesCalc = 0
      const months = data.plan !== 'Sem plano' ? parseInt(data.plan.charAt(0)) : 1
      if (prof.frequencia === 'Semanal') sessoesCalc = 4 * months
      else if (prof.frequencia === 'Quinzenal') sessoesCalc = 2 * months
      else if (prof.frequencia === 'Mensal') sessoesCalc = 1 * months
      else if (prof.frequencia === 'Conforme demanda') sessoesCalc = 1

      await pb.collection('profissionais_sessoes').create({
        user: userId,
        plano: planoId,
        profissional: prof.profissional,
        tipo_sessao: prof.tipoSessao,
        valor_sessao: prof.valorSessao,
        frequencia: prof.frequencia,
        total_sessoes_calculado: sessoesCalc,
      })
    }
  }
  return paciente
}

export const updatePacienteCompleto = async (
  id: string,
  data: any,
  userId: string,
  totalMargin: number,
) => {
  const paciente = await pb.collection('pacientes').update(id, {
    nome: data.name,
    data_nascimento: data.birthDate,
    telefone: data.phone,
    email: data.email,
    endereco: data.address,
  })

  let plano = null
  try {
    plano = await pb.collection('planos_skip').getFirstListItem(`paciente="${id}"`)
  } catch {
    /* intentionally ignored */
  }

  let planoId = plano?.id

  if (data.plan !== 'Sem plano') {
    const planData = {
      user: userId,
      paciente: id,
      tipo_plano: data.plan,
      data_inicio: data.startDate,
      data_termino: data.endDate || null,
      status: data.status,
      margem_total: totalMargin,
    }
    if (planoId) {
      await pb.collection('planos_skip').update(planoId, planData)
    } else {
      const newPlan = await pb.collection('planos_skip').create(planData)
      planoId = newPlan.id
    }
  } else {
    if (planoId) {
      const profs = await pb
        .collection('profissionais_sessoes')
        .getFullList({ filter: `plano="${planoId}"` })
      for (const p of profs) await pb.collection('profissionais_sessoes').delete(p.id)
      await pb.collection('planos_skip').delete(planoId)
      planoId = undefined
    }
  }

  if (planoId) {
    const oldProfs = await pb
      .collection('profissionais_sessoes')
      .getFullList({ filter: `plano="${planoId}"` })
    for (const p of oldProfs) await pb.collection('profissionais_sessoes').delete(p.id)

    for (const prof of data.professionals) {
      let sessoesCalc = 0
      const months = data.plan !== 'Sem plano' ? parseInt(data.plan.charAt(0)) : 1
      if (prof.frequencia === 'Semanal') sessoesCalc = 4 * months
      else if (prof.frequencia === 'Quinzenal') sessoesCalc = 2 * months
      else if (prof.frequencia === 'Mensal') sessoesCalc = 1 * months
      else if (prof.frequencia === 'Conforme demanda') sessoesCalc = 1

      await pb.collection('profissionais_sessoes').create({
        user: userId,
        plano: planoId,
        profissional: prof.profissional,
        tipo_sessao: prof.tipoSessao,
        valor_sessao: prof.valorSessao,
        frequencia: prof.frequencia,
        total_sessoes_calculado: sessoesCalc,
      })
    }
  }

  return paciente
}
