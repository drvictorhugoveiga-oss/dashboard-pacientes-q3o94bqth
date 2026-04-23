import { useState, useEffect } from 'react'
import { getPlanosExpandidos } from '@/services/planos'
import pb from '@/lib/pocketbase/client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useRealtime } from '@/hooks/use-realtime'
import { AlertCircle, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

function formatDate(dateStr: string | undefined | null) {
  if (!dateStr) return '-'
  try {
    return new Date(dateStr).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
  } catch (e) {
    return '-'
  }
}

export default function PlanosPage() {
  const [planos, setPlanos] = useState<any[]>([])
  const [planosViva, setPlanosViva] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const loadData = async () => {
    try {
      const [data, vivaData] = await Promise.all([
        getPlanosExpandidos(),
        pb.collection('planos_pacientes').getFullList({ expand: 'paciente_id,plano_viva_id' }),
      ])
      setPlanos(data)
      setPlanosViva(vivaData)
      setError(false)
    } catch (err) {
      console.error(err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('planos_skip', loadData)
  useRealtime('planos_pacientes', loadData)

  if (loading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div>
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="bg-destructive/10 p-4 rounded-full">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        <p className="text-lg font-medium text-foreground">
          Erro ao carregar os planos. Por favor, tente novamente.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Planos Skip & VIVA</h1>
          <p className="text-muted-foreground">
            Gerencie e visualize todos os planos contratados pelos pacientes.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/configuracoes-viva">
            <Settings className="w-4 h-4 mr-2" />
            Configurações VIVA
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Planos VIVA</CardTitle>
          <CardDescription>
            Visão geral dos planos VIVA ativos, inativos e vencidos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {planosViva.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
              Nenhum plano VIVA cadastrado.
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden mb-8">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Paciente</TableHead>
                    <TableHead>Plano VIVA</TableHead>
                    <TableHead>Data de Início</TableHead>
                    <TableHead>Data de Término</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Valor Total</TableHead>
                    <TableHead className="text-right">Saldo Líquido</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {planosViva.map((plano) => (
                    <TableRow key={plano.id}>
                      <TableCell className="font-medium">
                        {plano.expand?.paciente_id?.nome || 'Paciente não encontrado'}
                      </TableCell>
                      <TableCell>{plano.expand?.plano_viva_id?.nome_plano || 'N/A'}</TableCell>
                      <TableCell>{formatDate(plano.data_inicio)}</TableCell>
                      <TableCell>{formatDate(plano.data_termino)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            plano.status === 'Ativo'
                              ? 'default'
                              : plano.status === 'Vencido'
                                ? 'destructive'
                                : 'secondary'
                          }
                        >
                          {plano.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(plano.valor_total_plano || 0)}
                      </TableCell>
                      <TableCell className="text-right font-medium text-primary">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(plano.saldo_liquido || 0)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Planos Skip</CardTitle>
          <CardDescription>Visão geral de todos os planos Skip antigos.</CardDescription>
        </CardHeader>
        <CardContent>
          {planos.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
              Nenhum plano cadastrado.
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Paciente</TableHead>
                    <TableHead>Tipo de Plano</TableHead>
                    <TableHead>Data de Início</TableHead>
                    <TableHead>Data de Término</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Margem Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {planos.map((plano) => (
                    <TableRow key={plano.id}>
                      <TableCell className="font-medium">
                        {plano.expand?.paciente?.nome || 'Paciente não encontrado'}
                      </TableCell>
                      <TableCell>{plano.tipo_plano}</TableCell>
                      <TableCell>{formatDate(plano.data_inicio)}</TableCell>
                      <TableCell>{formatDate(plano.data_termino)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            plano.status === 'Ativo'
                              ? 'default'
                              : plano.status === 'Vencido'
                                ? 'destructive'
                                : 'secondary'
                          }
                        >
                          {plano.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium text-primary">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(plano.margem_total || 0)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
