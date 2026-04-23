import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PieChart, Pie, Cell } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { formatCurrency } from '@/lib/utils'
import { formatDate } from '@/lib/date-utils'

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
]

export function PlanDetailModal({ plan, onClose }: { plan: any; onClose: () => void }) {
  const sessoesPorProf = plan.realizadas.reduce((acc: any, s: any) => {
    if (!acc[s.profissional]) acc[s.profissional] = 0
    acc[s.profissional] += s.valor_sessao
    return acc
  }, {})

  const chartData = Object.keys(sessoesPorProf).map((key, i) => ({
    name: key,
    value: sessoesPorProf[key],
    fill: COLORS[i % COLORS.length],
  }))

  const sessoesGrouped = plan.realizadas.reduce((acc: any[], s: any) => {
    const existing = acc.find(
      (x) => x.profissional === s.profissional && x.tipo_sessao === s.tipo_sessao,
    )
    if (existing) {
      existing.qtd += 1
      existing.total += s.valor_sessao
    } else {
      acc.push({
        profissional: s.profissional,
        tipo_sessao: s.tipo_sessao,
        valor_sessao: s.valor_sessao,
        qtd: 1,
        total: s.valor_sessao,
      })
    }
    return acc
  }, [])

  const pieConfig = { value: { label: 'Receita' } }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Detalhes do Plano - {plan.expand?.paciente?.nome}</DialogTitle>
          <DialogDescription>
            {plan.tipo_plano} • {formatDate(plan.data_inicio)} até {formatDate(plan.data_termino)}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          <div>
            <h4 className="font-semibold mb-3">Distribuição de Receita</h4>
            <div className="h-[200px]">
              <ChartContainer config={pieConfig} className="w-full h-full">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent formatter={(v: number) => formatCurrency(v)} />}
                  />
                </PieChart>
              </ChartContainer>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3">
              Sessões Realizadas ({plan.realizadas.length} de {plan.previstas})
            </h4>
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Profissional</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Qtd</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessoesGrouped.map((s: any, i: number) => (
                    <TableRow key={i}>
                      <TableCell>{s.profissional}</TableCell>
                      <TableCell>{s.tipo_sessao}</TableCell>
                      <TableCell>{s.qtd}</TableCell>
                      <TableCell className="text-right">{formatCurrency(s.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
