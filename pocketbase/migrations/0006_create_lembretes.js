migrate(
  (app) => {
    const lembretes = new Collection({
      name: 'lembretes',
      type: 'base',
      listRule: "@request.auth.id != '' && user = @request.auth.id",
      viewRule: "@request.auth.id != '' && user = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && user = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user = @request.auth.id",
      fields: [
        {
          name: 'user',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'paciente',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('pacientes').id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'plano',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('planos_skip').id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'profissional',
          type: 'select',
          required: true,
          values: [
            'Médico',
            'Nutricionista',
            'Enfermeira',
            'Fonoaudióloga',
            'Psicóloga',
            'Fisioterapeuta',
          ],
          maxSelect: 1,
        },
        {
          name: 'tipo_contato',
          type: 'select',
          required: true,
          values: ['Consulta', 'Avaliação', 'Acompanhamento', 'Retorno'],
          maxSelect: 1,
        },
        { name: 'data_prevista', type: 'date', required: true },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['Pendente', 'Contatado', 'Não respondeu'],
          maxSelect: 1,
        },
        { name: 'data_contato', type: 'date' },
        { name: 'observacoes', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(lembretes)

    try {
      const user = app.findAuthRecordByEmail('_pb_users_auth_', 'vhvj12@gmail.com')

      const createSeed = (nome, prof, tipo, dataStr, status) => {
        try {
          const p = app.findFirstRecordByData('pacientes', 'nome', nome)
          const pl = app.findFirstRecordByData('planos_skip', 'paciente', p.id)

          const record = new Record(lembretes)
          record.set('user', user.id)
          record.set('paciente', p.id)
          record.set('plano', pl.id)
          record.set('profissional', prof)
          record.set('tipo_contato', tipo)
          record.set('data_prevista', dataStr)
          record.set('status', status)
          if (status === 'Contatado') {
            record.set('data_contato', new Date().toISOString().replace('T', ' '))
          }
          app.save(record)
        } catch (err) {
          console.log('Could not seed for ' + nome + ': ' + err.message)
        }
      }

      createSeed('João Silva', 'Médico', 'Consulta', '2026-04-25 10:00:00.000Z', 'Pendente')
      createSeed(
        'João Silva',
        'Psicóloga',
        'Acompanhamento',
        '2026-04-23 14:00:00.000Z',
        'Pendente',
      )
      createSeed(
        'Maria Santos',
        'Nutricionista',
        'Avaliação',
        '2026-04-20 09:00:00.000Z',
        'Contatado',
      )
      createSeed(
        'Carlos Oliveira',
        'Fisioterapeuta',
        'Acompanhamento',
        '2026-04-22 16:00:00.000Z',
        'Não respondeu',
      )
    } catch (e) {
      console.log('Seed base setup failed: ', e.message)
    }
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('lembretes')
    app.delete(collection)
  },
)
