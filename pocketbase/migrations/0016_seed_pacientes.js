migrate(
  (app) => {
    let admin
    try {
      admin = app.findAuthRecordByEmail('_pb_users_auth_', 'vhvj12@gmail.com')
    } catch (_) {
      return // No admin user to associate
    }

    const pacientesCol = app.findCollectionByNameOrId('pacientes')
    const planosConfigCol = app.findCollectionByNameOrId('planos_viva_config')
    const planosPacientesCol = app.findCollectionByNameOrId('planos_pacientes')

    const getOrCreatePlanoConfig = (nome) => {
      try {
        return app.findFirstRecordByData('planos_viva_config', 'nome_plano', nome)
      } catch (_) {
        const record = new Record(planosConfigCol)
        record.set('user', admin.id)
        record.set('nome_plano', nome)
        record.set('duracao_meses', 6)
        record.set('valor_plano', 1000)
        app.save(record)
        return record
      }
    }

    const plano2 = getOrCreatePlanoConfig('Plano VIVA 2')
    const plano3 = getOrCreatePlanoConfig('Plano VIVA 3')

    const seedData = [
      {
        nome: 'João Silva',
        data_nascimento: '1960-03-15T12:00:00.000Z',
        plano_config: plano2.id,
        data_inicio: '2026-04-01T12:00:00.000Z',
        data_termino: '2026-07-30T12:00:00.000Z',
        status: 'Ativo',
      },
      {
        nome: 'Maria Santos',
        data_nascimento: '1955-07-22T12:00:00.000Z',
        plano_config: plano3.id,
        data_inicio: '2026-03-01T12:00:00.000Z',
        data_termino: '2026-08-31T12:00:00.000Z',
        status: 'Ativo',
      },
      {
        nome: 'Carlos Oliveira',
        data_nascimento: '1950-11-10T12:00:00.000Z',
        plano_config: null,
        status: 'Ativo',
      },
    ]

    for (const data of seedData) {
      try {
        app.findFirstRecordByData('pacientes', 'nome', data.nome)
        continue // skip if exists
      } catch (_) {
        const p = new Record(pacientesCol)
        p.set('user', admin.id)
        p.set('nome', data.nome)
        p.set('data_nascimento', data.data_nascimento)
        app.save(p)

        if (data.plano_config) {
          const pp = new Record(planosPacientesCol)
          pp.set('user', admin.id)
          pp.set('paciente_id', p.id)
          pp.set('plano_viva_id', data.plano_config)
          pp.set('data_inicio', data.data_inicio)
          pp.set('data_termino', data.data_termino)
          pp.set('status', data.status)
          app.save(pp)
        }
      }
    }
  },
  (app) => {
    const pacientes = ['João Silva', 'Maria Santos', 'Carlos Oliveira']
    for (const nome of pacientes) {
      try {
        const record = app.findFirstRecordByData('pacientes', 'nome', nome)
        app.delete(record)
      } catch (_) {}
    }
  },
)
