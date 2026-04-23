import { useEffect, useState, useMemo } from 'react'
import { FileSpreadsheet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { getSessoes, updateSessao } from '@/services/sessoes'
import { getPacientes } from '@/services/pacientes'
import { getPlanosPacientesExpandidos } from '@/services/planos'
import { useRealtime } from '@/hooks/use-realtime'
import { isSameMonth, subMonths, isAfter, startOfMonth, parseISO, isBefore } from 'date-fns'
import { extractFieldErrors } from '@/lib/pocketbase/errors'
import { formatDate } from '@/lib/date-utils'

import type { Sessao, SessaoFiltersState } from './types'
import { SessoesFilters } from './components/SessoesFilters'
import { SessoesSummary } from './components/SessoesSummary'
import { SessoesList } from './components/SessoesList'
import { SessaoModals } from './components/SessaoModals'

const defaultFilters: SessaoFiltersState = {
  profissional: 'Todos',
  periodo: 'Todos',
  status: 'Todas',
}

export default function SessoesPage() {
  const { toast } = useToast()
  const [sessoes, setSessoes] = useState<Sessao[]>([])
  const [pacientes, setPacientes] = useState<any[]>([])
  const [planos, setPlanos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [rawFilters, setRawFilters] = useState<SessaoFiltersState>(defaultFilters)
  const [filters, setFilters] = useState<SessaoFiltersState>(defaultFilters)

  const [editingSessao, setEditingSessao] = useState<Sessao | null>(null)
  const [cancelingSessao, setCancelingSessao] = useState<Sessao | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setFilters(rawFilters), 300)
    return () => clearTimeout(t)
  }, [rawFilters])

  const loadData = async () => {
    try {
      const [sessData, pacData, planData] = await Promise.all([
        getSessoes(),
        getPacientes(),
        getPlanosPacientesExpandidos(),
      ])
      setSessoes(sessData as Sessao[])
      setPacientes(pacData)
      setPlanos(planData)
    } catch (err) {
      toast({ title: 'Erro ao carregar dados', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('sessoes', loadData)

  const filteredSessoes = useMemo(() => {
    const now = new Date()
    return sessoes.filter((item) => {
      if (filters.profissional !== 'Todos' && item.profissional !== filters.profissional)
        return false
      if (filters.status !== 'Todas' && item.status !== filters.status) return false

      const date = parseISO(item.data_sessao)
      if (filters.periodo === 'Este mês' && !isSameMonth(date, now)) return false
      if (filters.periodo === 'Mês anterior' && !isSameMonth(date, subMonths(now, 1))) return false
      if (filters.periodo === 'Últimos 3 meses' && !isAfter(date, startOfMonth(subMonths(now, 3))))
        return false
      if (filters.periodo === 'Últimos 6 meses' && !isAfter(date, startOfMonth(subMonths(now, 6))))
        return false
      if (filters.periodo === 'Personalizado') {
        if (filters.startDate && isBefore(date, parseISO(filters.startDate))) return false
        if (filters.endDate && isAfter(date, parseISO(filters.endDate))) return false
      }
      return true
    })
  }, [sessoes, filters])

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateSessao(id, { status })
      toast({ title: 'Status atualizado' })
    } catch (err) {
      toast({ title: 'Erro ao atualizar', variant: 'destructive' })
    }
  }

  const handleSaveEdit = async (id: string, data: any) => {
    try {
      const planoViva = planos.find((p) => p.paciente_id === data.paciente)?.id
      if (!planoViva) throw new Error('Paciente não possui plano VIVA ativo.')
      await updateSessao(id, { ...data, plano_viva: planoViva })
      toast({ title: 'Sessão atualizada com sucesso' })
      setEditingSessao(null)
    } catch (err: any) {
      const fieldErrors = extractFieldErrors(err)
      toast({
        title: 'Erro ao salvar',
        description: err.message || 'Verifique os dados',
        variant: 'destructive',
      })
    }
  }

  const handleSaveCancel = async (id: string, motivo: string) => {
    try {
      await updateSessao(id, { status: 'Cancelada', motivo_cancelamento: motivo })
      toast({ title: 'Sessão cancelada' })
      setCancelingSessao(null)
    } catch (err) {
      toast({ title: 'Erro ao cancelar', variant: 'destructive' })
    }
  }

  const handleExport = () => {
    let csv = `Relatorio de Sessoes\nPeriodo: ${filters.periodo}\nProfissional: ${filters.profissional}\n\n`
    csv += 'Data,Paciente,Profissional,Tipo,Valor,Status\n'
    filteredSessoes.forEach((s) => {
      csv += `${formatDate(s.data_sessao)},${s.expand?.paciente?.nome || '-'},${s.profissional},${s.tipo_sessao},${s.valor_sessao},${s.status}\n`
    })
    const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csv)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'sessoes_export.csv')
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Sessões por Profissional</h1>
        <Button onClick={handleExport} variant="outline" className="gap-2">
          <FileSpreadsheet className="h-4 w-4" /> Exportar relatório
        </Button>
      </div>

      <SessoesFilters
        filters={rawFilters}
        onChange={setRawFilters}
        onClear={() => setRawFilters(defaultFilters)}
      />

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <>
          <SessoesSummary data={filteredSessoes} />
          <SessoesList
            data={filteredSessoes}
            onStatusChange={handleStatusChange}
            onEdit={setEditingSessao}
            onCancel={setCancelingSessao}
          />
        </>
      )}

      <SessaoModals
        editingSessao={editingSessao}
        cancelingSessao={cancelingSessao}
        pacientes={pacientes}
        onCloseEdit={() => setEditingSessao(null)}
        onCloseCancel={() => setCancelingSessao(null)}
        onSaveEdit={handleSaveEdit}
        onSaveCancel={handleSaveCancel}
      />
    </div>
  )
}
