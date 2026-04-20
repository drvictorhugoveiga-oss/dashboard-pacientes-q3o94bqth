migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    let user
    try {
      user = app.findAuthRecordByEmail('_pb_users_auth_', 'vhvj12@gmail.com')
    } catch (_) {
      user = new Record(users)
      user.setEmail('vhvj12@gmail.com')
      user.setPassword('Skip@Pass')
      user.setVerified(true)
      user.set('name', 'Dra. Silva')
      app.save(user)
    }

    const pacientes = app.findCollectionByNameOrId('pacientes')
    const planos = app.findCollectionByNameOrId('planos_skip')

    try {
      app.findFirstRecordByData('pacientes', 'nome', 'João Silva')
      return // already seeded
    } catch (_) {}

    // Paciente 1
    const p1 = new Record(pacientes)
    p1.set('user', user.id)
    p1.set('nome', 'João Silva')
    p1.set('data_nascimento', '1960-03-15 12:00:00.000Z')
    app.save(p1)

    const plano1 = new Record(planos)
    plano1.set('user', user.id)
    plano1.set('paciente', p1.id)
    plano1.set('tipo_plano', '3 meses')
    plano1.set('data_inicio', new Date().toISOString())
    const p1End = new Date()
    p1End.setMonth(p1End.getMonth() + 3)
    plano1.set('data_termino', p1End.toISOString())
    plano1.set('status', 'Ativo')
    app.save(plano1)

    // Paciente 2
    const p2 = new Record(pacientes)
    p2.set('user', user.id)
    p2.set('nome', 'Maria Santos')
    p2.set('data_nascimento', '1955-07-22 12:00:00.000Z')
    app.save(p2)

    const plano2 = new Record(planos)
    plano2.set('user', user.id)
    plano2.set('paciente', p2.id)
    plano2.set('tipo_plano', '6 meses')
    plano2.set('data_inicio', new Date().toISOString())
    const p2End = new Date()
    p2End.setMonth(p2End.getMonth() + 6)
    plano2.set('data_termino', p2End.toISOString())
    plano2.set('status', 'Ativo')
    app.save(plano2)

    // Paciente 3
    const p3 = new Record(pacientes)
    p3.set('user', user.id)
    p3.set('nome', 'Carlos Oliveira')
    p3.set('data_nascimento', '1950-11-10 12:00:00.000Z')
    app.save(p3)
  },
  (app) => {
    try {
      const user = app.findAuthRecordByEmail('_pb_users_auth_', 'vhvj12@gmail.com')
      app.delete(user)
    } catch (_) {}
  },
)
