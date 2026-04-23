import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { PagamentoProfissional } from '@/services/pagamentos'
import { format } from 'date-fns'

export function PagamentoModal({
  pagamento,
  onClose,
  onSave,
}: {
  pagamento: PagamentoProfissional
  onClose: () => void
  onSave: (data: any) => void
}) {
  const [status, setStatus] = useState(pagamento.status_pagamento)
  const [date, setDate] = useState(
    pagamento.data_pagamento ? format(new Date(pagamento.data_pagamento), 'yyyy-MM-dd') : '',
  )

  const handleSave = () => {
    onSave({
      status_pagamento: status,
      data_pagamento: date ? new Date(date).toISOString() : null,
    })
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Pagamento - {pagamento.profissional}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Status do Pagamento</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pendente">Pendente</SelectItem>
                <SelectItem value="Parcial">Parcial</SelectItem>
                <SelectItem value="Pago">Pago</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Data do Pagamento</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
