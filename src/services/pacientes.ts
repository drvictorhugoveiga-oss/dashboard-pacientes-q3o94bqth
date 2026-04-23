import pb from '@/lib/pocketbase/client'

export const getPacientes = () => pb.collection('pacientes').getFullList({ sort: 'nome' })
