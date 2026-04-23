migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    let user
    try {
      user = app.findAuthRecordByEmail('_pb_users_auth_', 'vhvj12@gmail.com')
    } catch (_) {
      return
    }

    const pagamentosCol = app.findCollectionByNameOrId('pagamentos_profissionais')

    const existingPagamentos = app.findRecordsByFilter(
      'pagamentos_profissionais',
      'user = {:u}',
      '-created',
      1,
      0,
      { u: user.id },
    )
    if (existingPagamentos && existingPagamentos.length > 0) return

    const p1 = new Record(pagamentosCol)
    p1.set('user', user.id)
    p1.set('profissional', 'Psicóloga')
    p1.set('total_sessoes', 10)
    p1.set('valor_total', 2500)
    p1.set('status_pagamento', 'Pago')
    p1.set('data_pagamento', '2026-04-20 12:00:00.000Z')
    app.save(p1)

    const p2 = new Record(pagamentosCol)
    p2.set('user', user.id)
    p2.set('profissional', 'Fisioterapeuta')
    p2.set('total_sessoes', 8)
    p2.set('valor_total', 1200)
    p2.set('status_pagamento', 'Pendente')
    app.save(p2)

    const p3 = new Record(pagamentosCol)
    p3.set('user', user.id)
    p3.set('profissional', 'Nutricionista')
    p3.set('total_sessoes', 4)
    p3.set('valor_total', 1800)
    p3.set('status_pagamento', 'Parcial')
    p3.set('data_pagamento', '2026-04-15 12:00:00.000Z')
    app.save(p3)

    const pacientesCol = app.findCollectionByNameOrId('pacientes')
    const planosCol = app.findCollectionByNameOrId('planos_skip')
    const sessoesCol = app.findCollectionByNameOrId('sessoes')

    let pJoao = new Record(pacientesCol)
    pJoao.set('user', user.id)
    pJoao.set('nome', 'João Silva (Relatório)')
    app.save(pJoao)

    let planJoao = new Record(planosCol)
    planJoao.set('user', user.id)
    planJoao.set('paciente', pJoao.id)
    planJoao.set('tipo_plano', '3 meses')
    planJoao.set('data_inicio', '2026-04-01 12:00:00.000Z')
    planJoao.set('status', 'Ativo')
    planJoao.set('margem_total', 1600)
    app.save(planJoao)

    for (let i = 0; i < 8; i++) {
      let s = new Record(sessoesCol)
      s.set('user', user.id)
      s.set('paciente', pJoao.id)
      s.set('plano', planJoao.id)
      s.set('profissional', 'Médico')
      s.set('tipo_sessao', 'Consulta')
      s.set('data_sessao', `2026-04-${String(i + 2).padStart(2, '0')} 10:00:00.000Z`)
      s.set('valor_sessao', 400)
      s.set('status', 'Realizada')
      app.save(s)
    }

    let pMaria = new Record(pacientesCol)
    pMaria.set('user', user.id)
    pMaria.set('nome', 'Maria Santos (Relatório)')
    app.save(pMaria)

    let planMaria = new Record(planosCol)
    planMaria.set('user', user.id)
    planMaria.set('paciente', pMaria.id)
    planMaria.set('tipo_plano', '6 meses')
    planMaria.set('data_inicio', '2026-03-01 12:00:00.000Z')
    planMaria.set('status', 'Ativo')
    planMaria.set('margem_total', 2700)
    app.save(planMaria)

    for (let i = 0; i < 18; i++) {
      let s = new Record(sessoesCol)
      s.set('user', user.id)
      s.set('paciente', pMaria.id)
      s.set('plano', planMaria.id)
      s.set('profissional', 'Fisioterapeuta')
      s.set('tipo_sessao', 'Acompanhamento')
      s.set('data_sessao', `2026-03-${String((i % 28) + 1).padStart(2, '0')} 14:00:00.000Z`)
      s.set('valor_sessao', 300)
      s.set('status', 'Realizada')
      app.save(s)
    }
  },
  (app) => {},
)
