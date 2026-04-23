import pb from '@/lib/pocketbase/client'

export interface Lembrete {
  id: string
  user: string
  paciente: string
  plano_viva?: string
  profissional: string
  tipo_contato: string
  data_prevista: string
  status: string
  data_contato?: string
  observacoes?: string
  expand?: {
    paciente?: {
      nome: string
    }
    plano_viva?: {
      expand?: {
        plano_viva_id?: {
          nome_plano: string
        }
      }
    }
  }
}

export const getLembretes = async (
  filters: { status?: string; profissional?: string; dataRange?: string } = {},
) => {
  if (!pb.authStore.record?.id) return []

  let filterString = `user = "${pb.authStore.record.id}"`

  if (filters.status && filters.status !== 'Todos') {
    filterString += ` && status = "${filters.status}"`
  }

  if (filters.profissional && filters.profissional !== 'Todos') {
    filterString += ` && profissional = "${filters.profissional}"`
  }

  const now = new Date()

  if (filters.dataRange === 'Esta semana') {
    const start = new Date(now)
    start.setDate(now.getDate() - now.getDay())
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    filterString += ` && data_prevista >= "${start.toISOString().split('T')[0]} 00:00:00" && data_prevista <= "${end.toISOString().split('T')[0]} 23:59:59"`
  } else if (filters.dataRange === 'Este mês') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    filterString += ` && data_prevista >= "${start.toISOString().split('T')[0]} 00:00:00" && data_prevista <= "${end.toISOString().split('T')[0]} 23:59:59"`
  } else if (filters.dataRange === 'Próximos 7 dias') {
    const end = new Date(now)
    end.setDate(now.getDate() + 7)
    filterString += ` && data_prevista >= "${now.toISOString().split('T')[0]} 00:00:00" && data_prevista <= "${end.toISOString().split('T')[0]} 23:59:59"`
  } else if (filters.dataRange === 'Próximos 30 dias') {
    const end = new Date(now)
    end.setDate(now.getDate() + 30)
    filterString += ` && data_prevista >= "${now.toISOString().split('T')[0]} 00:00:00" && data_prevista <= "${end.toISOString().split('T')[0]} 23:59:59"`
  }

  return pb.collection('lembretes').getFullList<Lembrete>({
    filter: filterString,
    sort: 'data_prevista',
    expand: 'paciente,plano_viva.plano_viva_id',
  })
}

export const getLembretesSummary = async () => {
  if (!pb.authStore.record?.id) return { pendentes: 0, contatadosEsteMes: 0, naoRespondidos: 0 }

  const records = await pb.collection('lembretes').getFullList<Lembrete>({
    filter: `user = "${pb.authStore.record.id}"`,
  })

  const now = new Date()
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  let pendentes = 0
  let contatadosEsteMes = 0
  let naoRespondidos = 0

  records.forEach((r) => {
    if (r.status === 'Pendente') pendentes++
    if (r.status === 'Não respondeu') naoRespondidos++
    if (r.status === 'Contatado') {
      const dataContato = r.data_contato ? new Date(r.data_contato) : new Date() // fallback
      if (dataContato >= thisMonthStart) {
        contatadosEsteMes++
      }
    }
  })

  return { pendentes, contatadosEsteMes, naoRespondidos }
}

export const updateLembreteStatus = async (id: string, status: string) => {
  const data: any = { status }
  if (status === 'Contatado') {
    data.data_contato = new Date().toISOString()
  }
  return pb.collection('lembretes').update<Lembrete>(id, data)
}

export const postponeLembrete = async (id: string, newDate: Date) => {
  return pb.collection('lembretes').update<Lembrete>(id, {
    data_prevista: newDate.toISOString(),
    status: 'Pendente',
  })
}
