import pb from '@/lib/pocketbase/client'

export const getSessoes = () =>
  pb
    .collection('sessoes')
    .getFullList({ expand: 'paciente,plano_viva.plano_viva_id', sort: '-data_sessao' })

export const updateSessao = (id: string, data: any) => pb.collection('sessoes').update(id, data)

export const createSessao = (data: any) => pb.collection('sessoes').create(data)

export const deleteSessao = (id: string) => pb.collection('sessoes').delete(id)
