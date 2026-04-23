import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { PlanDetailModal } from './PlanDetailModal'

export function PlanosTable({ planos, sessoes }: { planos: any[]; sessoes: any[] }) {
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null)

  const data = planos
    .map((p) => {
      const pSessoes = sessoes.filter((s) => s.plano_viva === p.id)
      const realizadas = pSessoes.filter((s) => s.status === 'Realizada')
      const receita = p.valor_total_plano || 0
      const custo = p.custo_equipe_total || receita * 0.5
      const margem = p.saldo_liquido || receita - custo
      const mPerc = receita > 0 ? (margem / receita) * 100 : 0

      const vivaConfig = p.expand?.plano_viva_id
      const previstas = vivaConfig ? vivaConfig.duracao_meses * 4 : 0

      return { ...p, receita, custo, margem, mPerc, pSessoes, realizadas, previstas }
    })
    .filter((p) => p.receita > 0 || p.custo > 0 || p.realizadas.length > 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rentabilidade por Plano</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum dado para o período selecionado
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Sessões</TableHead>
                <TableHead>Receita</TableHead>
                <TableHead>Custo</TableHead>
                <TableHead>Margem</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right print:hidden">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.expand?.paciente_id?.nome || 'N/A'}
                  </TableCell>
                  <TableCell>{item.expand?.plano_viva_id?.nome_plano || 'N/A'}</TableCell>
                  <TableCell>
                    {item.realizadas.length} / {item.previstas}
                  </TableCell>
                  <TableCell>{formatCurrency(item.receita)}</TableCell>
                  <TableCell>{formatCurrency(item.custo)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{formatCurrency(item.margem)}</span>
                      <span className="text-xs text-muted-foreground">
                        {item.mPerc.toFixed(1)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.status === 'Ativo' ? 'default' : 'secondary'}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right print:hidden">
                    <Button variant="ghost" size="icon" onClick={() => setSelectedPlan(item)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      {selectedPlan && (
        <PlanDetailModal plan={selectedPlan} onClose={() => setSelectedPlan(null)} />
      )}
    </Card>
  )
}
