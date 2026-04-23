import pb from '@/lib/pocketbase/client'

export const getPacientes = () => pb.collection('pacientes').getFullList({ sort: 'nome' })

export const getPacienteCompleto = (id: string) => pb.collection('pacientes').getOne(id)

export const createPacienteCompleto = (data: any) => pb.collection('pacientes').create(data)

export const updatePacienteCompleto = (id: string, data: any) =>
  pb.collection('pacientes').update(id, data)
