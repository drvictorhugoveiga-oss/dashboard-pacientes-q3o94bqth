import pb from '@/lib/pocketbase/client'

export interface PagamentoProfissional {
  id: string
  profissional: string
  total_sessoes: number
  valor_total: number
  status_pagamento: string
  data_pagamento?: string
  created: string
}

export const getPagamentos = () =>
  pb.collection('pagamentos_profissionais').getFullList<PagamentoProfissional>({ sort: '-created' })

export const updatePagamento = (id: string, data: any) =>
  pb.collection('pagamentos_profissionais').update<PagamentoProfissional>(id, data)

export const createPagamento = (data: any) =>
  pb.collection('pagamentos_profissionais').create<PagamentoProfissional>(data)

export const deletePagamento = (id: string) => pb.collection('pagamentos_profissionais').delete(id)
