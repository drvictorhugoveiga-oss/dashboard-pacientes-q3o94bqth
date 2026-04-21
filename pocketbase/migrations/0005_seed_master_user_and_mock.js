migrate(
  (app) => {
    let user
    try {
      user = app.findAuthRecordByEmail('_pb_users_auth_', 'vhvj12@gmail.com')
      user.setPassword('Geriatria@6d')
      app.save(user)
    } catch (_) {
      const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
      user = new Record(usersCol)
      user.setEmail('vhvj12@gmail.com')
      user.setPassword('Geriatria@6d')
      user.setVerified(true)
      user.set('name', 'Admin')
      app.save(user)
    }

    try {
      app.findFirstRecordByData('pacientes', 'email', 'joao@email.com')
      return
    } catch (_) {}

    const pacCol = app.findCollectionByNameOrId('pacientes')
    const pac = new Record(pacCol)
    pac.set('user', user.id)
    pac.set('nome', 'João Silva')
    pac.set('data_nascimento', '1960-03-15 12:00:00.000Z')
    pac.set('telefone', '(11) 98765-4321')
    pac.set('email', 'joao@email.com')
    pac.set('endereco', 'Rua A, 123')
    app.save(pac)

    const planCol = app.findCollectionByNameOrId('planos_skip')
    const plano = new Record(planCol)
    plano.set('user', user.id)
    plano.set('paciente', pac.id)
    plano.set('tipo_plano', '3 meses')
    plano.set('data_inicio', '2026-04-01 12:00:00.000Z')
    plano.set('data_termino', '2026-07-01 12:00:00.000Z')
    plano.set('status', 'Ativo')
    plano.set('margem_total', 4800)
    app.save(plano)

    const profCol = app.findCollectionByNameOrId('profissionais_sessoes')

    const prof1 = new Record(profCol)
    prof1.set('user', user.id)
    prof1.set('plano', plano.id)
    prof1.set('profissional', 'Psicóloga')
    prof1.set('tipo_sessao', 'Acompanhamento')
    prof1.set('valor_sessao', 250)
    prof1.set('frequencia', 'Semanal')
    prof1.set('total_sessoes_calculado', 12)
    app.save(prof1)

    const prof2 = new Record(profCol)
    prof2.set('user', user.id)
    prof2.set('plano', plano.id)
    prof2.set('profissional', 'Fisioterapeuta')
    prof2.set('tipo_sessao', 'Acompanhamento')
    prof2.set('valor_sessao', 150)
    prof2.set('frequencia', 'Semanal')
    prof2.set('total_sessoes_calculado', 12)
    app.save(prof2)
  },
  (app) => {
    try {
      const pac = app.findFirstRecordByData('pacientes', 'email', 'joao@email.com')
      app.delete(pac)
    } catch (_) {}
  },
)
