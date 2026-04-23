migrate(
  (app) => {
    const collections = ['planos_skip', 'sessoes', 'lembretes']
    for (const name of collections) {
      try {
        const col = app.findCollectionByNameOrId(name)
        const field = col.fields.getByName('paciente')
        if (field) {
          field.cascadeDelete = true
          app.save(col)
        }
      } catch (_) {
        // Ignorar se a coleção não existir
      }
    }

    const planoCols = ['profissionais_sessoes', 'sessoes', 'lembretes']
    for (const name of planoCols) {
      try {
        const col = app.findCollectionByNameOrId(name)
        const field = col.fields.getByName('plano')
        if (field) {
          field.cascadeDelete = true
          app.save(col)
        }
      } catch (_) {
        // Ignorar se a coleção não existir
      }
    }
  },
  (app) => {
    const collections = ['planos_skip', 'sessoes', 'lembretes']
    for (const name of collections) {
      try {
        const col = app.findCollectionByNameOrId(name)
        const field = col.fields.getByName('paciente')
        if (field) {
          field.cascadeDelete = false
          app.save(col)
        }
      } catch (_) {}
    }

    const planoCols = ['profissionais_sessoes', 'sessoes', 'lembretes']
    for (const name of planoCols) {
      try {
        const col = app.findCollectionByNameOrId(name)
        const field = col.fields.getByName('plano')
        if (field) {
          field.cascadeDelete = false
          app.save(col)
        }
      } catch (_) {}
    }
  },
)
