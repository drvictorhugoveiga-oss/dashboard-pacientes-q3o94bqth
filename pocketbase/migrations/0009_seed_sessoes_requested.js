migrate(
  (app) => {
    let user
    try {
      user = app.findAuthRecordByEmail('_pb_users_auth_', 'vhvj12@gmail.com')
    } catch (_) {
      return // Skip if no admin user to link
    }

    const getOrCreatePaciente = (nome) => {
      try {
        const records = app.findRecordsByFilter('pacientes', `nome = '${nome}'`, '', 1, 0)
        if (records.length > 0) return records[0]
      } catch (_) {}
      const col = app.findCollectionByNameOrId('pacientes')
      const record = new Record(col)
      record.set('nome', nome)
      record.set('user', user.id)
      app.save(record)
      return record
    }

    const getOrCreatePlano = (pacienteId) => {
      try {
        const records = app.findRecordsByFilter(
          'planos_skip',
          `paciente = '${pacienteId}'`,
          '',
          1,
          0,
        )
        if (records.length > 0) return records[0]
      } catch (_) {}
      const col = app.findCollectionByNameOrId('planos_skip')
      const record = new Record(col)
      record.set('user', user.id)
      record.set('paciente', pacienteId)
      record.set('tipo_plano', '3 meses')
      record.set('status', 'Ativo')
      app.save(record)
      return record
    }

    const p1 = getOrCreatePaciente('João Silva')
    const p2 = getOrCreatePaciente('Maria Santos')
    const p3 = getOrCreatePaciente('Carlos Oliveira')

    const pl1 = getOrCreatePlano(p1.id)
    const pl2 = getOrCreatePlano(p2.id)
    const pl3 = getOrCreatePlano(p3.id)

    const sessoesData = [
      {
        data: '2026-04-20 10:00:00.000Z',
        pac: p1.id,
        plano: pl1.id,
        prof: 'Psicóloga',
        tipo: 'Acompanhamento',
        valor: 250,
        status: 'Realizada',
      },
      {
        data: '2026-04-21 10:00:00.000Z',
        pac: p1.id,
        plano: pl1.id,
        prof: 'Fisioterapeuta',
        tipo: 'Acompanhamento',
        valor: 150,
        status: 'Realizada',
      },
      {
        data: '2026-04-22 10:00:00.000Z',
        pac: p2.id,
        plano: pl2.id,
        prof: 'Nutricionista',
        tipo: 'Retorno',
        valor: 450,
        status: 'Realizada',
      },
      {
        data: '2026-04-23 10:00:00.000Z',
        pac: p3.id,
        plano: pl3.id,
        prof: 'Médico',
        tipo: 'Consulta',
        valor: 300,
        status: 'Pendente',
      },
      {
        data: '2026-04-19 10:00:00.000Z',
        pac: p1.id,
        plano: pl1.id,
        prof: 'Fonoaudióloga',
        tipo: 'Avaliação',
        valor: 168,
        status: 'Cancelada',
      },
    ]

    const col = app.findCollectionByNameOrId('sessoes')
    sessoesData.forEach((s) => {
      try {
        const datePart = s.data.substring(0, 10)
        const existing = app.findRecordsByFilter(
          'sessoes',
          `data_sessao ~ '${datePart}' && paciente = '${s.pac}'`,
          '',
          1,
          0,
        )
        if (existing.length > 0) return
      } catch (_) {}

      const record = new Record(col)
      record.set('user', user.id)
      record.set('paciente', s.pac)
      record.set('plano', s.plano)
      record.set('profissional', s.prof)
      record.set('tipo_sessao', s.tipo)
      record.set('data_sessao', s.data)
      record.set('valor_sessao', s.valor)
      record.set('status', s.status)
      app.save(record)
    })
  },
  (app) => {},
)
