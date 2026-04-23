import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { Sessao } from '../types'

interface Props {
  editingSessao: Sessao | null
  cancelingSessao: Sessao | null
  pacientes: any[]
  onCloseEdit: () => void
  onCloseCancel: () => void
  onSaveEdit: (id: string, data: any) => Promise<void>
  onSaveCancel: (id: string, motivo: string) => Promise<void>
}

export function SessaoModals({
  editingSessao,
  cancelingSessao,
  pacientes,
  onCloseEdit,
  onCloseCancel,
  onSaveEdit,
  onSaveCancel,
}: Props) {
  const [formData, setFormData] = useState<any>({})
  const [motivo, setMotivo] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (editingSessao) {
      setFormData({
        data_sessao: editingSessao.data_sessao.substring(0, 10),
        paciente: editingSessao.paciente,
        tipo_sessao: editingSessao.tipo_sessao,
        valor_sessao: editingSessao.valor_sessao,
        status: editingSessao.status,
      })
    }
  }, [editingSessao])

  useEffect(() => {
    if (!cancelingSessao) setMotivo('')
  }, [cancelingSessao])

  const handleSaveEdit = async () => {
    if (!editingSessao) return
    setLoading(true)
    const payload = {
      ...formData,
      data_sessao: new Date(formData.data_sessao).toISOString(),
      valor_sessao: Number(formData.valor_sessao),
    }
    await onSaveEdit(editingSessao.id, payload)
    setLoading(false)
  }

  const handleSaveCancel = async () => {
    if (!cancelingSessao) return
    setLoading(true)
    await onSaveCancel(cancelingSessao.id, motivo)
    setLoading(false)
  }

  return (
    <>
      <Dialog open={!!editingSessao} onOpenChange={(o) => !o && onCloseEdit()}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Sessão</DialogTitle>
            <DialogDescription>Atualize os detalhes da sessão abaixo.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Paciente</label>
              <Select
                value={formData.paciente}
                onValueChange={(v) => setFormData({ ...formData, paciente: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o paciente" />
                </SelectTrigger>
                <SelectContent>
                  {pacientes.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Data da Sessão</label>
              <Input
                type="date"
                value={formData.data_sessao || ''}
                onChange={(e) => setFormData({ ...formData, data_sessao: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Tipo de Sessão</label>
              <Select
                value={formData.tipo_sessao}
                onValueChange={(v) => setFormData({ ...formData, tipo_sessao: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {['Consulta', 'Avaliação', 'Acompanhamento', 'Retorno'].map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Valor (R$)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.valor_sessao || ''}
                onChange={(e) => setFormData({ ...formData, valor_sessao: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={formData.status}
                onValueChange={(v) => setFormData({ ...formData, status: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {['Realizada', 'Cancelada', 'Pendente'].map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onCloseEdit} disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit} disabled={loading}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!cancelingSessao} onOpenChange={(o) => !o && onCloseCancel()}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Cancelar Sessão</DialogTitle>
            <DialogDescription>
              Deseja realmente cancelar esta sessão? Informe o motivo abaixo (opcional).
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Motivo do Cancelamento</label>
              <Textarea
                placeholder="Ex: Paciente desmarcou por imprevisto..."
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onCloseCancel} disabled={loading}>
              Voltar
            </Button>
            <Button variant="destructive" onClick={handleSaveCancel} disabled={loading}>
              Confirmar Cancelamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
