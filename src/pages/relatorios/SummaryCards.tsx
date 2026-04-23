import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { DollarSign, TrendingDown, TrendingUp, Percent } from 'lucide-react'

export function SummaryCards({ sessoes, pagamentos }: { sessoes: any[]; pagamentos: any[] }) {
  const receita = sessoes
    .filter((s) => s.status === 'Realizada')
    .reduce((acc, s) => acc + s.valor_sessao, 0)
  const custos = pagamentos.reduce((acc, p) => acc + p.valor_total, 0)
  const margem = receita - custos
  const margemPerc = receita > 0 ? (margem / receita) * 100 : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
          <TrendingUp className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(receita)}</div>
          <p className="text-xs text-muted-foreground">Em sessões realizadas</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Custos Totais</CardTitle>
          <TrendingDown className="h-4 w-4 text-rose-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(custos)}</div>
          <p className="text-xs text-muted-foreground">Pagamentos a profissionais</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Margem Total</CardTitle>
          <DollarSign className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(margem)}</div>
          <p className="text-xs text-muted-foreground">Lucro absoluto</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Margem %</CardTitle>
          <Percent className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{margemPerc.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">Eficiência da clínica</p>
        </CardContent>
      </Card>
    </div>
  )
}
