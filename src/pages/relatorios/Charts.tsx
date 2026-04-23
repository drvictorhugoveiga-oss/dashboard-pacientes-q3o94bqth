import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { formatCurrency } from '@/lib/utils'

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
]

export function FinancialCharts({ sessoes, pagamentos }: { sessoes: any[]; pagamentos: any[] }) {
  const monthsMap: Record<string, { name: string; receita: number; custo: number }> = {}

  sessoes
    .filter((s) => s.status === 'Realizada')
    .forEach((s) => {
      const d = parseISO(s.data_sessao)
      const key = format(d, 'MMM/yy', { locale: ptBR })
      if (!monthsMap[key]) monthsMap[key] = { name: key, receita: 0, custo: 0 }
      monthsMap[key].receita += s.valor_sessao
    })

  pagamentos.forEach((p) => {
    const d = p.data_pagamento ? parseISO(p.data_pagamento) : parseISO(p.created)
    const key = format(d, 'MMM/yy', { locale: ptBR })
    if (!monthsMap[key]) monthsMap[key] = { name: key, receita: 0, custo: 0 }
    monthsMap[key].custo += p.valor_total
  })

  const lineData = Object.values(monthsMap)

  const dueMap: Record<string, number> = {}
  pagamentos
    .filter((p) => p.status_pagamento !== 'Pago')
    .forEach((p) => {
      if (!dueMap[p.profissional]) dueMap[p.profissional] = 0
      dueMap[p.profissional] += p.valor_total
    })
  const barData = Object.keys(dueMap).map((k, i) => ({
    name: k,
    amount: dueMap[k],
    fill: COLORS[i % COLORS.length],
  }))

  const revMap: Record<string, number> = {}
  sessoes
    .filter((s) => s.status === 'Realizada')
    .forEach((s) => {
      if (!revMap[s.profissional]) revMap[s.profissional] = 0
      revMap[s.profissional] += s.valor_sessao
    })
  const pieData = Object.keys(revMap).map((k, i) => ({
    name: k,
    value: revMap[k],
    fill: COLORS[i % COLORS.length],
  }))

  const lineConfig = {
    receita: { label: 'Receita', color: 'hsl(var(--chart-2))' },
    custo: { label: 'Custos', color: 'hsl(var(--chart-5))' },
  }

  const barConfig = { amount: { label: 'A Receber' } }
  const pieConfig = { value: { label: 'Receita' } }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card className="col-span-1 md:col-span-2 lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-sm">Receita vs Custos</CardTitle>
        </CardHeader>
        <CardContent className="h-[250px]">
          <ChartContainer config={lineConfig} className="w-full h-full">
            <LineChart data={lineData} margin={{ left: -20, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `R$${v}`}
              />
              <ChartTooltip
                content={<ChartTooltipContent formatter={(v: number) => formatCurrency(v)} />}
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Line
                type="monotone"
                name="Receita"
                dataKey="receita"
                stroke="var(--color-receita)"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                name="Custos"
                dataKey="custo"
                stroke="var(--color-custo)"
                strokeWidth={2}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">A Receber</CardTitle>
        </CardHeader>
        <CardContent className="h-[250px]">
          <ChartContainer config={barConfig} className="w-full h-full">
            <BarChart data={barData} margin={{ left: -20, right: 10 }}>
              <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} />
              <ChartTooltip
                content={<ChartTooltipContent formatter={(v: number) => formatCurrency(v)} />}
              />
              <Bar dataKey="amount" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Receita por Categoria</CardTitle>
        </CardHeader>
        <CardContent className="h-[250px]">
          <ChartContainer config={pieConfig} className="w-full h-full">
            <PieChart>
              <Pie
                data={pieData}
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
        </CardContent>
      </Card>
    </div>
  )
}
