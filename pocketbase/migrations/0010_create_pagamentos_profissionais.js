migrate(
  (app) => {
    const collection = new Collection({
      name: 'pagamentos_profissionais',
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
        { name: 'total_sessoes', type: 'number', required: true, onlyInt: true },
        { name: 'valor_total', type: 'number', required: true },
        {
          name: 'status_pagamento',
          type: 'select',
          required: true,
          values: ['Pendente', 'Pago', 'Parcial'],
          maxSelect: 1,
        },
        { name: 'data_pagamento', type: 'date' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('pagamentos_profissionais')
    app.delete(collection)
  },
)
