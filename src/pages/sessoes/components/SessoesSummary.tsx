import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Sessao } from '../types'

export function SessoesSummary({ data }: { data: Sessao[] }) {
  const byProf = data.reduce(
    (acc, curr) => {
      const prof = curr.profissional
      if (!acc[prof]) acc[prof] = { realized: 0, cancelled: 0, pending: 0, value: 0 }
      if (curr.status === 'Realizada') {
        acc[prof].realized++
        acc[prof].value += curr.valor_sessao
      } else if (curr.status === 'Cancelada') {
        acc[prof].cancelled++
      } else {
        acc[prof].pending++
      }
      return acc
    },
    {} as Record<string, { realized: number; cancelled: number; pending: number; value: number }>,
  )

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  const entries = Object.entries(byProf)

  if (entries.length === 0) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
      {entries.map(([prof, stats]) => {
        const avg = stats.realized > 0 ? stats.value / stats.realized : 0
        return (
          <Card key={prof} className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold text-primary">{prof}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                <div className="flex flex-col">
                  <span className="text-muted-foreground text-xs">Realizadas</span>
                  <span className="font-semibold text-emerald-600">{stats.realized}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground text-xs">Pendentes</span>
                  <span className="font-semibold text-amber-600">{stats.pending}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground text-xs">Canceladas</span>
                  <span className="font-semibold text-rose-600">{stats.cancelled}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground text-xs">Valor Total</span>
                  <span className="font-semibold">{formatCurrency(stats.value)}</span>
                </div>
                <div className="flex flex-col col-span-2 pt-2 border-t mt-1">
                  <span className="text-muted-foreground text-xs">Ticket Médio (Realizadas)</span>
                  <span className="font-bold text-base">{formatCurrency(avg)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
