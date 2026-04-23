import pb from '@/lib/pocketbase/client'

export const getPlanos = () => pb.collection('planos_skip').getFullList()

export const getPlanosExpandidos = () =>
  pb.collection('planos_skip').getFullList({ expand: 'paciente' })
