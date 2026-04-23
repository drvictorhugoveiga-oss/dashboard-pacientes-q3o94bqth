onRecordUpdate((e) => {
  const record = e.record
  const original = record.original()

  if (record.getString('plano_viva_id') === original.getString('plano_viva_id')) {
    return e.next()
  }

  const planoVivaId = record.getString('plano_viva_id')
  if (!planoVivaId) return e.next()

  try {
    const planoViva = $app.findRecordById('planos_viva_config', planoVivaId)
    const valorPlano = planoViva.getFloat('valor_plano')
    const prolaborePerc = planoViva.getFloat('prolabore_medico_percentual')

    let custoEquipeTotal = 0
    const custos = $app.findRecordsByFilter(
      'custos_equipe_config',
      'plano_viva_id = {:id}',
      '',
      100,
      0,
      { id: planoVivaId },
    )

    for (const c of custos) {
      custoEquipeTotal += c.getFloat('valor_sessao') * c.getInt('quantidade_sessoes')
    }

    const prolaboreValor = valorPlano * (prolaborePerc / 100)
    const saldoLiquido = valorPlano - prolaboreValor - custoEquipeTotal

    record.set('valor_total_plano', valorPlano)
    record.set('prolabore_medico_valor', prolaboreValor)
    record.set('custo_equipe_total', custoEquipeTotal)
    record.set('saldo_liquido', saldoLiquido)
  } catch (err) {
    $app.logger().error('Error calculating planos_pacientes values on update', 'error', err.message)
  }

  return e.next()
}, 'planos_pacientes')
