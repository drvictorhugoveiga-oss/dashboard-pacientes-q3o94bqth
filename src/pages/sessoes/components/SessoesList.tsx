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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, CheckCircle, Edit, XCircle, CalendarDays } from 'lucide-react'
import { formatDate } from '@/lib/date-utils'
import type { Sessao } from '../types'
import { Card, CardContent } from '@/components/ui/card'

interface Props {
  data: Sessao[]
  onStatusChange: (id: string, status: string) => void
  onEdit: (s: Sessao) => void
  onCancel: (s: Sessao) => void
}

export function SessoesList({ data, onStatusChange, onEdit, onCancel }: Props) {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Realizada':
        return (
          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none">
            Realizada
          </Badge>
        )
      case 'Cancelada':
        return (
          <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-200 border-none">
            Cancelada
          </Badge>
        )
      default:
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-none">
            Pendente
          </Badge>
        )
    }
  }

  const renderActions = (s: Sessao) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {s.status !== 'Realizada' && (
          <DropdownMenuItem
            onClick={() => onStatusChange(s.id, 'Realizada')}
            className="text-emerald-600 cursor-pointer"
          >
            <CheckCircle className="mr-2 h-4 w-4" /> Marcar como Realizada
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => onEdit(s)} className="cursor-pointer">
          <Edit className="mr-2 h-4 w-4" /> Editar Sessão
        </DropdownMenuItem>
        {s.status !== 'Cancelada' && (
          <DropdownMenuItem onClick={() => onCancel(s)} className="text-destructive cursor-pointer">
            <XCircle className="mr-2 h-4 w-4" /> Cancelar Sessão
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center bg-card rounded-xl border border-dashed">
        <CalendarDays className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
        <h3 className="text-lg font-semibold">Nenhuma sessão registrada</h3>
        <p className="text-muted-foreground text-sm max-w-sm mt-1">
          Não encontramos sessões com os filtros selecionados.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="hidden md:block rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Data da sessão</TableHead>
              <TableHead>Paciente</TableHead>
              <TableHead>Profissional</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{formatDate(s.data_sessao)}</TableCell>
                <TableCell>{s.expand?.paciente?.nome || 'Desconhecido'}</TableCell>
                <TableCell>{s.profissional}</TableCell>
                <TableCell>{s.tipo_sessao}</TableCell>
                <TableCell>{formatCurrency(s.valor_sessao)}</TableCell>
                <TableCell>{getStatusBadge(s.status)}</TableCell>
                <TableCell>{renderActions(s)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="md:hidden space-y-4">
        {data.map((s) => (
          <Card key={s.id} className="shadow-sm">
            <CardContent className="p-4 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-base">
                    {s.expand?.paciente?.nome || 'Desconhecido'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(s.data_sessao)} • {s.profissional}
                  </div>
                </div>
                {renderActions(s)}
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <div className="text-sm font-medium">{formatCurrency(s.valor_sessao)}</div>
                {getStatusBadge(s.status)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  )
}
