import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit2, X, Check, AlertCircle } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'

interface PlanoViva {
  id: string
  nome_plano: string
  duracao_meses: number
  valor_plano: number
  prolabore_medico_percentual: number
}

function PlanoRow({
  plano,
  onSave,
}: {
  plano: PlanoViva
  onSave: (p: PlanoViva) => Promise<void>
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [valor, setValor] = useState(plano.valor_plano || 0)
  const [percentual, setPercentual] = useState(plano.prolabore_medico_percentual || 25)

  const handleSave = async () => {
    if (valor < 1000 || valor > 50000) {
      toast.error('Valor do Plano deve ser entre R$ 1.000,00 e R$ 50.000,00')
      return
    }
    if (percentual < 10 || percentual > 50) {
      toast.error('Prolabore Médico deve ser entre 10% e 50%')
      return
    }
    await onSave({ ...plano, valor_plano: valor, prolabore_medico_percentual: percentual })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setValor(plano.valor_plano || 0)
    setPercentual(plano.prolabore_medico_percentual || 25)
    setIsEditing(false)
  }

  const prolaboreValor = (valor * percentual) / 100

  return (
    <TableRow>
      <TableCell className="font-medium">{plano.nome_plano}</TableCell>
      <TableCell>{plano.duracao_meses} meses</TableCell>
      <TableCell>
        {isEditing ? (
          <Input
            type="number"
            value={valor}
            onChange={(e) => setValor(Number(e.target.value))}
            className="w-32"
          />
        ) : (
          <span
            onClick={() => setIsEditing(true)}
            className="cursor-pointer hover:underline decoration-dashed decoration-primary/50 underline-offset-4"
          >
            R${' '}
            {valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        )}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <Input
            type="number"
            value={percentual}
            onChange={(e) => setPercentual(Number(e.target.value))}
            className="w-24"
          />
        ) : (
          <span
            onClick={() => setIsEditing(true)}
            className="cursor-pointer hover:underline decoration-dashed decoration-primary/50 underline-offset-4"
          >
            {percentual}%
          </span>
        )}
      </TableCell>
      <TableCell>
        R${' '}
        {prolaboreValor.toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handleSave}>
              <Check className="h-4 w-4 mr-1" /> Salvar
            </Button>
            <Button size="sm" variant="ghost" onClick={handleCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
            <Edit2 className="h-4 w-4 mr-2" /> Editar
          </Button>
        )}
      </TableCell>
    </TableRow>
  )
}

function PlanoCard({
  plano,
  onSave,
}: {
  plano: PlanoViva
  onSave: (p: PlanoViva) => Promise<void>
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [valor, setValor] = useState(plano.valor_plano || 0)
  const [percentual, setPercentual] = useState(plano.prolabore_medico_percentual || 25)

  const handleSave = async () => {
    if (valor < 1000 || valor > 50000) {
      toast.error('Valor do Plano deve ser entre R$ 1.000,00 e R$ 50.000,00')
      return
    }
    if (percentual < 10 || percentual > 50) {
      toast.error('Prolabore Médico deve ser entre 10% e 50%')
      return
    }
    await onSave({ ...plano, valor_plano: valor, prolabore_medico_percentual: percentual })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setValor(plano.valor_plano || 0)
    setPercentual(plano.prolabore_medico_percentual || 25)
    setIsEditing(false)
  }

  const prolaboreValor = (valor * percentual) / 100

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex justify-between items-center">
          {plano.nome_plano}
          <span className="text-sm font-normal text-muted-foreground px-2 py-1 bg-secondary rounded-md">
            {plano.duracao_meses} meses
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Valor do Plano</span>
          {isEditing ? (
            <Input
              type="number"
              value={valor}
              onChange={(e) => setValor(Number(e.target.value))}
              className="w-32 text-right"
            />
          ) : (
            <span
              onClick={() => setIsEditing(true)}
              className="text-sm cursor-pointer hover:underline decoration-dashed decoration-primary/50 underline-offset-4"
            >
              R${' '}
              {valor.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          )}
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Prolabore Médico %</span>
          {isEditing ? (
            <Input
              type="number"
              value={percentual}
              onChange={(e) => setPercentual(Number(e.target.value))}
              className="w-24 text-right"
            />
          ) : (
            <span
              onClick={() => setIsEditing(true)}
              className="text-sm cursor-pointer hover:underline decoration-dashed decoration-primary/50 underline-offset-4"
            >
              {percentual}%
            </span>
          )}
        </div>
        <div className="flex justify-between items-center pt-2 border-t">
          <span className="text-sm font-semibold">Prolabore Valor</span>
          <span className="text-sm font-semibold text-primary">
            R${' '}
            {prolaboreValor.toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
      </CardContent>
      <CardFooter className="pt-0 justify-end gap-2">
        {isEditing ? (
          <>
            <Button size="sm" variant="ghost" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button size="sm" onClick={handleSave}>
              Salvar
            </Button>
          </>
        ) : (
          <Button size="sm" variant="outline" className="w-full" onClick={() => setIsEditing(true)}>
            <Edit2 className="h-4 w-4 mr-2" /> Editar Valores
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

export default function PlanosConfigPage() {
  const navigate = useNavigate()
  const [planos, setPlanos] = useState<PlanoViva[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const loadPlanos = async () => {
    setLoading(true)
    setError(false)
    try {
      const data = await pb.collection('planos_viva_config').getFullList<PlanoViva>({
        sort: 'duracao_meses',
      })
      setPlanos(data)
    } catch (err) {
      console.error('Error fetching planos:', err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPlanos()
  }, [])

  const handleSavePlano = async (plano: PlanoViva) => {
    try {
      await pb.collection('planos_viva_config').update(plano.id, {
        valor_plano: plano.valor_plano,
        prolabore_medico_percentual: plano.prolabore_medico_percentual,
      })
      toast.success('Plano atualizado com sucesso!')
      setPlanos((prev) => prev.map((p) => (p.id === plano.id ? plano : p)))
    } catch (err) {
      console.error('Error saving plano:', err)
      toast.error('Erro ao salvar. Tente novamente.')
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex items-start gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate(-1)}
          className="shrink-0 mt-1"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações de Planos VIVA</h1>
          <p className="text-muted-foreground mt-1">
            Edite os valores dos planos. As alterações refletem automaticamente em todo o dashboard.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : error ? (
        <div className="text-center py-12 space-y-4 bg-muted/30 rounded-lg border border-dashed">
          <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
          <p className="text-muted-foreground">Erro ao carregar configurações.</p>
          <Button onClick={loadPlanos} variant="outline">
            Tentar novamente
          </Button>
        </div>
      ) : planos.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed text-muted-foreground">
          Nenhum plano configurado
        </div>
      ) : (
        <>
          <div className="hidden md:block rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome do Plano</TableHead>
                  <TableHead>Duração</TableHead>
                  <TableHead>Valor do Plano</TableHead>
                  <TableHead>Prolabore Médico %</TableHead>
                  <TableHead>Prolabore Médico Valor</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {planos.map((p) => (
                  <PlanoRow key={p.id} plano={p} onSave={handleSavePlano} />
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="block md:hidden space-y-4">
            {planos.map((p) => (
              <PlanoCard key={p.id} plano={p} onSave={handleSavePlano} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
