import pb from '@/lib/pocketbase/client'

export const getPacientes = async () => {
  const pacientes = await pb.collection('pacientes').getFullList({ sort: 'nome' })
  const planos = await pb.collection('planos_pacientes').getFullList({ expand: 'plano_viva_id' })

  return pacientes.map((p) => {
    const plano =
      planos.find((pl) => pl.paciente_id === p.id && pl.status !== 'Inativo') ||
      planos.find((pl) => pl.paciente_id === p.id)
    return {
      ...p,
      vivaPlanId: plano?.expand?.plano_viva_id?.id,
      vivaPlanName: plano?.expand?.plano_viva_id?.nome_plano || 'Sem Plano',
      vivaStatus: plano?.status || 'Sem Plano',
      vivaStartDate: plano?.data_inicio,
      vivaEndDate: plano?.data_termino,
    }
  })
}

export const deletePaciente = (id: string) => pb.collection('pacientes').delete(id)

export const getPacienteCompleto = async (id: string) => {
  const paciente = await pb.collection('pacientes').getOne(id)
  let planoViva = null

  try {
    planoViva = await pb
      .collection('planos_pacientes')
      .getFirstListItem(`paciente_id="${id}"`, { sort: '-created', expand: 'plano_viva_id' })
  } catch {
    /* intentionally ignored */
  }

  return { paciente, planoViva }
}

export const createPacienteCompleto = async (data: any, userId: string) => {
  const paciente = await pb.collection('pacientes').create({
    user: userId,
    nome: data.name,
    data_nascimento: data.birthDate,
    telefone: data.phone,
    email: data.email,
    endereco: data.address,
  })

  if (data.vivaPlanId) {
    await pb.collection('planos_pacientes').create({
      user: userId,
      paciente_id: paciente.id,
      plano_viva_id: data.vivaPlanId,
      data_inicio: data.vivaStartDate || new Date().toISOString(),
      data_termino: data.vivaEndDate || new Date().toISOString(),
      status: data.vivaStatus || 'Ativo',
    })
  }

  return paciente
}

export const updatePacienteCompleto = async (id: string, data: any, userId: string) => {
  const paciente = await pb.collection('pacientes').update(id, {
    nome: data.name,
    data_nascimento: data.birthDate,
    telefone: data.phone,
    email: data.email,
    endereco: data.address,
  })

  let planoVivaOld = null
  try {
    planoVivaOld = await pb.collection('planos_pacientes').getFirstListItem(`paciente_id="${id}"`)
  } catch {
    /* intentionally ignored */
  }

  if (data.vivaPlanId) {
    const vData = {
      user: userId,
      paciente_id: id,
      plano_viva_id: data.vivaPlanId,
      data_inicio: data.vivaStartDate || new Date().toISOString(),
      data_termino: data.vivaEndDate || new Date().toISOString(),
      status: data.vivaStatus || 'Ativo',
    }
    if (planoVivaOld) {
      await pb.collection('planos_pacientes').update(planoVivaOld.id, vData)
    } else {
      await pb.collection('planos_pacientes').create(vData)
    }
  } else if (planoVivaOld) {
    await pb.collection('planos_pacientes').delete(planoVivaOld.id)
  }

  return paciente
}
