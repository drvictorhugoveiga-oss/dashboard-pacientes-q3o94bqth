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
import { Edit2, CheckCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { formatDate } from '@/lib/date-utils'
import { PagamentoModal } from './PagamentoModal'
import { PagamentoProfissional } from '@/services/pagamentos'

export function PagamentosTable({
  pagamentos,
  onUpdate,
}: {
  pagamentos: PagamentoProfissional[]
  onUpdate: any
}) {
  const [editing, setEditing] = useState<PagamentoProfissional | null>(null)

  const handleMarkPaid = (p: PagamentoProfissional) => {
    onUpdate(p.id, { status_pagamento: 'Pago', data_pagamento: new Date().toISOString() })
  }

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'Pago':
        return 'bg-emerald-500/10 text-emerald-500'
      case 'Pendente':
        return 'bg-rose-500/10 text-rose-500'
      case 'Parcial':
        return 'bg-yellow-500/10 text-yellow-500'
      default:
        return ''
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pagamentos a Profissionais</CardTitle>
      </CardHeader>
      <CardContent>
        {pagamentos.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum dado para o período selecionado
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Profissional</TableHead>
                <TableHead>Total Sessões</TableHead>
                <TableHead>Valor Médio</TableHead>
                <TableHead>Total a Receber</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data Pag.</TableHead>
                <TableHead className="text-right print:hidden">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagamentos.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.profissional}</TableCell>
                  <TableCell>{p.total_sessoes}</TableCell>
                  <TableCell>{formatCurrency(p.valor_total / (p.total_sessoes || 1))}</TableCell>
                  <TableCell className="font-bold">{formatCurrency(p.valor_total)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(p.status_pagamento)}>
                      {p.status_pagamento}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(p.data_pagamento)}</TableCell>
                  <TableCell className="text-right print:hidden">
                    <div className="flex justify-end gap-2">
                      {p.status_pagamento !== 'Pago' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleMarkPaid(p)}
                          title="Marcar como Pago"
                        >
                          <CheckCircle className="h-4 w-4 text-emerald-500" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => setEditing(p)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      {editing && (
        <PagamentoModal
          pagamento={editing}
          onClose={() => setEditing(null)}
          onSave={(data) => {
            onUpdate(editing.id, data)
            setEditing(null)
          }}
        />
      )}
    </Card>
  )
}
