migrate(
  (app) => {
    const collection = new Collection({
      name: 'profissionais_sessoes',
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
          maxSelect: 1,
        },
        {
          name: 'plano',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('planos_skip').id,
          maxSelect: 1,
          cascadeDelete: true,
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
          name: 'tipo_sessao',
          type: 'select',
          required: true,
          values: ['Consulta', 'Avaliação', 'Acompanhamento', 'Retorno'],
          maxSelect: 1,
        },
        { name: 'valor_sessao', type: 'number', required: true },
        {
          name: 'frequencia',
          type: 'select',
          required: true,
          values: ['Semanal', 'Quinzenal', 'Mensal', 'Conforme demanda'],
          maxSelect: 1,
        },
        { name: 'total_sessoes_calculado', type: 'number', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('profissionais_sessoes')
    app.delete(collection)
  },
)
