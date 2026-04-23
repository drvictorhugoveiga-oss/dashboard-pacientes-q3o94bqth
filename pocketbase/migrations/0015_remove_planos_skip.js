migrate(
  (app) => {
    // Update sessoes collection
    try {
      const sessoes = app.findCollectionByNameOrId('sessoes')
      sessoes.fields.removeByName('plano')
      const planosPacientes = app.findCollectionByNameOrId('planos_pacientes')
      sessoes.fields.add(
        new RelationField({
          name: 'plano_viva',
          collectionId: planosPacientes.id,
          cascadeDelete: false,
          maxSelect: 1,
        }),
      )
      app.save(sessoes)
    } catch (err) {
      console.error('Error updating sessoes:', err)
    }

    // Update lembretes collection
    try {
      const lembretes = app.findCollectionByNameOrId('lembretes')
      lembretes.fields.removeByName('plano')
      const planosPacientes = app.findCollectionByNameOrId('planos_pacientes')
      lembretes.fields.add(
        new RelationField({
          name: 'plano_viva',
          collectionId: planosPacientes.id,
          cascadeDelete: false,
          maxSelect: 1,
        }),
      )
      app.save(lembretes)
    } catch (err) {
      console.error('Error updating lembretes:', err)
    }

    // Delete profissionais_sessoes
    try {
      const profSessoes = app.findCollectionByNameOrId('profissionais_sessoes')
      app.delete(profSessoes)
    } catch (err) {
      console.log('profissionais_sessoes already deleted or not found.')
    }

    // Delete planos_skip
    try {
      const planosSkip = app.findCollectionByNameOrId('planos_skip')
      app.delete(planosSkip)
    } catch (err) {
      console.log('planos_skip already deleted or not found.')
    }
  },
  (app) => {
    console.log('Revert not implemented for data removal.')
  },
)
