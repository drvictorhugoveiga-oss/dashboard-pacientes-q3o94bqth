import { useState, useEffect, useMemo } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { SummaryCards } from './SummaryCards'
import { PlanosTable } from './PlanosTable'
import { PagamentosTable } from './PagamentosTable'
import { FinancialCharts } from './Charts'
import { getSessoes } from '@/services/sessoes'
import { getPagamentos, updatePagamento, PagamentoProfissional } from '@/services/pagamentos'
import { getPlanosPacientesExpandidos } from '@/services/planos'
import { isAfter, isBefore, subMonths, startOfMonth, endOfMonth, parseISO } from 'date-fns'
import { toast } from 'sonner'
import { Download, FileText, FilterX } from 'lucide-react'

export default function RelatoriosPage() {
  const [sessoes, setSessoes] = useState<any[]>([])
  const [pagamentos, setPagamentos] = useState<PagamentoProfissional[]>([])
  const [planos, setPlanos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [periodo, setPeriodo] = useState('last_6')
  const [profissional, setProfissional] = useState('all')

  const loadData = async () => {
    try {
      const [sRes, pRes, plRes] = await Promise.all([
        getSessoes(),
        getPagamentos(),
        getPlanosPacientesExpandidos(),
      ])
      setSessoes(sRes)
      setPagamentos(pRes)
      setPlanos(plRes)
    } catch (error) {
      toast.error('Erro ao carregar dados financeiros')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleUpdatePagamento = async (id: string, data: any) => {
    try {
      await updatePagamento(id, data)
      toast.success('Pagamento atualizado!')
      loadData()
    } catch (e) {
      toast.error('Erro ao atualizar pagamento')
    }
  }

  const { filteredSessoes, filteredPagamentos } = useMemo(() => {
    let s = sessoes
    let p = pagamentos

    if (profissional !== 'all') {
      s = s.filter((x) => x.profissional === profissional)
      p = p.filter((x) => x.profissional === profissional)
    }

    const now = new Date()
    let startD: Date | null = null
    let endD: Date | null = null

    switch (periodo) {
      case 'this_month': {
        startD = startOfMonth(now)
        endD = endOfMonth(now)
        break
      }
      case 'last_month': {
        const last = subMonths(now, 1)
        startD = startOfMonth(last)
        endD = endOfMonth(last)
        break
      }
      case 'last_3': {
        startD = startOfMonth(subMonths(now, 3))
        endD = endOfMonth(now)
        break
      }
      case 'last_6': {
        startD = startOfMonth(subMonths(now, 6))
        endD = endOfMonth(now)
        break
      }
    }

    if (startD && endD) {
      s = s.filter((x) => {
        const d = parseISO(x.data_sessao)
        return isAfter(d, startD) && isBefore(d, endD)
      })
      p = p.filter((x) => {
        const d = parseISO(x.created)
        return isAfter(d, startD) && isBefore(d, endD)
      })
    }

    return { filteredSessoes: s, filteredPagamentos: p }
  }, [sessoes, pagamentos, periodo, profissional])

  const exportCSV = () => {
    const headers = ['Profissional', 'Total de sessões', 'Valor total', 'Status de pagamento']
    const rows = filteredPagamentos.map((p) => [
      p.profissional,
      p.total_sessoes,
      p.valor_total.toFixed(2),
      p.status_pagamento,
    ])
    const csv = [headers, ...rows].map((row) => row.join(';')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'pagamentos.csv'
    link.click()
    toast.success('Planilha exportada com sucesso')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios Financeiros</h1>
          <p className="text-muted-foreground">
            Acompanhe receitas, custos e pagamentos da clínica.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCSV}>
            <Download className="mr-2 h-4 w-4" /> CSV Pagamentos
          </Button>
          <Button onClick={() => window.print()}>
            <FileText className="mr-2 h-4 w-4" /> Exportar PDF
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 print:hidden">
        <Select value={periodo} onValueChange={setPeriodo}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="this_month">Este mês</SelectItem>
            <SelectItem value="last_month">Mês anterior</SelectItem>
            <SelectItem value="last_3">Últimos 3 meses</SelectItem>
            <SelectItem value="last_6">Últimos 6 meses</SelectItem>
            <SelectItem value="all">Todo o período</SelectItem>
          </SelectContent>
        </Select>

        <Select value={profissional} onValueChange={setProfissional}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Profissional" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Profissionais</SelectItem>
            <SelectItem value="Médico">Médico</SelectItem>
            <SelectItem value="Nutricionista">Nutricionista</SelectItem>
            <SelectItem value="Fisioterapeuta">Fisioterapeuta</SelectItem>
            <SelectItem value="Psicóloga">Psicóloga</SelectItem>
            <SelectItem value="Fonoaudióloga">Fonoaudióloga</SelectItem>
            <SelectItem value="Enfermeira">Enfermeira</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="ghost"
          onClick={() => {
            setPeriodo('last_6')
            setProfissional('all')
          }}
        >
          <FilterX className="mr-2 h-4 w-4" /> Limpar
        </Button>
      </div>

      {!loading && (
        <div className="space-y-8 print:space-y-4">
          <SummaryCards sessoes={filteredSessoes} pagamentos={filteredPagamentos} />

          <FinancialCharts sessoes={filteredSessoes} pagamentos={filteredPagamentos} />

          <div className="grid grid-cols-1 gap-8 print:block print:space-y-8">
            <PlanosTable planos={planos} sessoes={filteredSessoes} />
            <PagamentosTable pagamentos={filteredPagamentos} onUpdate={handleUpdatePagamento} />
          </div>
        </div>
      )}
    </div>
  )
}
