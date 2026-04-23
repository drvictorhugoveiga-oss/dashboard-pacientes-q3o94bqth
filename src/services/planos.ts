import pb from '@/lib/pocketbase/client'

export const getPlanosViva = () => pb.collection('planos_viva_config').getFullList()

export const getPlanosPacientesExpandidos = () =>
  pb
    .collection('planos_pacientes')
    .getFullList({ expand: 'paciente_id,plano_viva_id', sort: '-created' })
