onRecordAfterCreateSuccess((e) => {
  const sessao = e.record
  const profissional = sessao.getString('profissional')
  const user = sessao.getString('user')
  const planoId = sessao.getString('plano')

  if (!planoId || !user || !profissional) return e.next()

  try {
    const plano = $app.findRecordById('planos_skip', planoId)
    const pacienteId = plano.getString('paciente')
    const dataInicioStr = plano.getString('data_inicio')

    const dataInicio = dataInicioStr ? new Date(dataInicioStr) : new Date()
    const lembretes = $app.findCollectionByNameOrId('lembretes')

    const createLembrete = (daysOffset, tipo, status = 'Pendente') => {
      const dataPrevista = new Date(dataInicio)
      dataPrevista.setDate(dataPrevista.getDate() + daysOffset)

      const record = new Record(lembretes)
      record.set('user', user)
      record.set('paciente', pacienteId)
      record.set('plano', planoId)
      record.set('profissional', profissional)
      record.set('tipo_contato', tipo)
      record.set('data_prevista', dataPrevista.toISOString().replace('T', ' '))
      record.set('status', status)
      $app.save(record)
    }

    if (profissional === 'Médico') {
      createLembrete(27, 'Consulta')
    } else if (profissional === 'Psicóloga' || profissional === 'Fisioterapeuta') {
      createLembrete(5, 'Acompanhamento')
      createLembrete(12, 'Acompanhamento')
      createLembrete(19, 'Acompanhamento')
      createLembrete(26, 'Acompanhamento')
      createLembrete(41, 'Acompanhamento')
      createLembrete(56, 'Acompanhamento')
    } else if (profissional === 'Nutricionista') {
      createLembrete(27, 'Avaliação')
      createLembrete(57, 'Retorno')
    } else {
      createLembrete(7, 'Acompanhamento')
    }
  } catch (err) {
    console.log('Error generating lembretes: ', err.message)
  }

  return e.next()
}, 'profissionais_sessoes')
