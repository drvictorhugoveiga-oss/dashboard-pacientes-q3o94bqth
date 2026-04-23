import pb from '@/lib/pocketbase/client'

export const getPlanos = () => pb.collection('planos_skip').getFullList()
