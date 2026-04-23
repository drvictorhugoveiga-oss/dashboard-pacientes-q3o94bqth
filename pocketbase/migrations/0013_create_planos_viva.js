migrate(
  (app) => {
    const planosVivaConfig = new Collection({
      name: 'planos_viva_config',
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
        { name: 'nome_plano', type: 'text', required: true },
        { name: 'duracao_meses', type: 'number', required: true },
        { name: 'valor_plano', type: 'number', required: true },
        { name: 'prolabore_medico_percentual', type: 'number', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(planosVivaConfig)

    const custosEquipeConfig = new Collection({
      name: 'custos_equipe_config',
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
          name: 'plano_viva_id',
          type: 'relation',
          required: true,
          collectionId: planosVivaConfig.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'profissional',
          type: 'select',
          required: true,
          maxSelect: 1,
          values: [
            'Médico',
            'Nutricionista',
            'Enfermeira',
            'Fonoaudióloga',
            'Psicóloga',
            'Fisioterapeuta',
          ],
        },
        { name: 'valor_sessao', type: 'number', required: true },
        { name: 'quantidade_sessoes', type: 'number', required: true, onlyInt: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(custosEquipeConfig)

    const pacientesCol = app.findCollectionByNameOrId('pacientes')

    const planosPacientes = new Collection({
      name: 'planos_pacientes',
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
          name: 'paciente_id',
          type: 'relation',
          required: true,
          collectionId: pacientesCol.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'plano_viva_id',
          type: 'relation',
          required: true,
          collectionId: planosVivaConfig.id,
          cascadeDelete: false,
          maxSelect: 1,
        },
        { name: 'data_inicio', type: 'date', required: true },
        { name: 'data_termino', type: 'date', required: true },
        {
          name: 'status',
          type: 'select',
          required: true,
          maxSelect: 1,
          values: ['Ativo', 'Inativo', 'Vencido'],
        },
        { name: 'valor_total_plano', type: 'number', required: false },
        { name: 'prolabore_medico_valor', type: 'number', required: false },
        { name: 'custo_equipe_total', type: 'number', required: false },
        { name: 'saldo_liquido', type: 'number', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(planosPacientes)
  },
  (app) => {
    const planosPacientes = app.findCollectionByNameOrId('planos_pacientes')
    app.delete(planosPacientes)

    const custosEquipeConfig = app.findCollectionByNameOrId('custos_equipe_config')
    app.delete(custosEquipeConfig)

    const planosVivaConfig = app.findCollectionByNameOrId('planos_viva_config')
    app.delete(planosVivaConfig)
  },
)
