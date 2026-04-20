migrate(
  (app) => {
    const pacientesCol = app.findCollectionByNameOrId('pacientes')

    const collection = new Collection({
      name: 'planos_skip',
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
          collectionId: pacientesCol.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'tipo_plano',
          type: 'select',
          values: ['3 meses', '4 meses', '6 meses'],
          maxSelect: 1,
        },
        { name: 'data_inicio', type: 'date' },
        { name: 'data_termino', type: 'date' },
        { name: 'status', type: 'select', values: ['Ativo', 'Inativo', 'Vencido'], maxSelect: 1 },
        { name: 'margem_total', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('planos_skip')
    app.delete(collection)
  },
)
