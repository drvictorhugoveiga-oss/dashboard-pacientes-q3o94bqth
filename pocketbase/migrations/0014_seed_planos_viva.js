migrate(
  (app) => {
    let user
    try {
      user = app.findAuthRecordByEmail('_pb_users_auth_', 'vhvj12@gmail.com')
    } catch (_) {
      return
    }

    const planosVivaCol = app.findCollectionByNameOrId('planos_viva_config')
    const custosEquipeCol = app.findCollectionByNameOrId('custos_equipe_config')
    const planosPacientesCol = app.findCollectionByNameOrId('planos_pacientes')
    const pacientesCol = app.findCollectionByNameOrId('pacientes')

    const planos = [
      { nome: 'VIVA 1', duracao: 3, valor: 3000, prolabore: 25 },
      { nome: 'VIVA 2', duracao: 4, valor: 4000, prolabore: 25 },
      { nome: 'VIVA 3', duracao: 6, valor: 6000, prolabore: 25 },
      { nome: 'VIVA ANUAL', duracao: 12, valor: 12000, prolabore: 25 },
    ]

    const planIds = {}

    for (const p of planos) {
      try {
        const existing = app.findFirstRecordByData('planos_viva_config', 'nome_plano', p.nome)
        planIds[p.nome] = existing.id
      } catch (_) {
        const record = new Record(planosVivaCol)
        record.set('user', user.id)
        record.set('nome_plano', p.nome)
        record.set('duracao_meses', p.duracao)
        record.set('valor_plano', p.valor)
        record.set('prolabore_medico_percentual', p.prolabore)
        app.save(record)
        planIds[p.nome] = record.id
      }
    }

    const viva2Id = planIds['VIVA 2']
    if (viva2Id) {
      const custos = [
        { prof: 'Psicóloga', valor: 250, qtd: 4 },
        { prof: 'Fisioterapeuta', valor: 150, qtd: 4 },
        { prof: 'Nutricionista', valor: 450, qtd: 1 },
        { prof: 'Fonoaudióloga', valor: 168, qtd: 0 },
        { prof: 'Enfermeira', valor: 0, qtd: 0 },
        { prof: 'Médico', valor: 0, qtd: 0 },
      ]

      for (const c of custos) {
        try {
          const existing = app.findRecordsByFilter(
            'custos_equipe_config',
            `plano_viva_id = '${viva2Id}' && profissional = '${c.prof}'`,
            '',
            1,
            0,
          )
          if (existing.length === 0) throw new Error('not found')
        } catch (_) {
          const record = new Record(custosEquipeCol)
          record.set('user', user.id)
          record.set('plano_viva_id', viva2Id)
          record.set('profissional', c.prof)
          record.set('valor_sessao', c.valor)
          record.set('quantidade_sessoes', c.qtd)
          app.save(record)
        }
      }
    }

    let paciente
    try {
      paciente = app.findFirstRecordByData('pacientes', 'nome', 'João Silva')
    } catch (_) {
      try {
        const pacs = app.findRecordsByFilter('pacientes', "user != ''", '', 1, 0)
        if (pacs.length > 0) {
          paciente = pacs[0]
        }
      } catch (_) {}
    }

    if (!paciente) {
      const record = new Record(pacientesCol)
      record.set('user', user.id)
      record.set('nome', 'João Silva')
      record.set('data_nascimento', '1980-05-15 12:00:00.000Z')
      record.set('telefone', '11999999999')
      app.save(record)
      paciente = record
    }

    if (paciente && viva2Id) {
      try {
        app.findFirstRecordByData('planos_pacientes', 'paciente_id', paciente.id)
      } catch (_) {
        const record = new Record(planosPacientesCol)
        record.set('user', user.id)
        record.set('paciente_id', paciente.id)
        record.set('plano_viva_id', viva2Id)
        record.set('data_inicio', '2026-04-01 12:00:00.000Z')
        record.set('data_termino', '2026-07-30 12:00:00.000Z')
        record.set('status', 'Ativo')
        record.set('valor_total_plano', 4000)
        record.set('prolabore_medico_valor', 1000)
        record.set('custo_equipe_total', 1600)
        record.set('saldo_liquido', 1400)
        app.save(record)
      }
    }
  },
  (app) => {
    app.db().newQuery('DELETE FROM planos_pacientes').execute()
    app.db().newQuery('DELETE FROM custos_equipe_config').execute()
    app.db().newQuery('DELETE FROM planos_viva_config').execute()
  },
)
