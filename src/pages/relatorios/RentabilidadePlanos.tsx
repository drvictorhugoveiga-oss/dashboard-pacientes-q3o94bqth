import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { AlertCircle, FileEdit, Users } from 'lucide-react'
import { getPlanosViva, getCustosEquipe } from '@/services/planos'
import { useRealtime } from '@/hooks/use-realtime'
import { cn } from '@/lib/utils'

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function RentabilidadePlanos() {
  const [planos, setPlanos] = useState<any[]>([])
  const [custos, setCustos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    try {
      const [p, c] = await Promise.all([getPlanosViva(), getCustosEquipe()])
      setPlanos(p)
      setCustos(c)
      setError(null)
    } catch (e) {
      setError('Erro ao carregar dados de rentabilidade.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  useRealtime('planos_viva_config', loadData)
  useRealtime('custos_equipe_config', loadData)

  const planStats = useMemo(() => {
    return planos.map((plan) => {
      const planCosts = custos.filter((c) => c.plano_viva_id === plan.id)
      const custoEquipe = planCosts.reduce(
        (acc, curr) => acc + (curr.valor_sessao || 0) * (curr.quantidade_sessoes || 0),
        0,
      )
      const prolabore = (plan.valor_plano || 0) * ((plan.prolabore_medico_percentual || 0) / 100)
      const saldoLiquido = (plan.valor_plano || 0) - prolabore - custoEquipe
      const margem = plan.valor_plano ? (saldoLiquido / plan.valor_plano) * 100 : 0

      return { ...plan, custoEquipe, prolabore, saldoLiquido, margem }
    })
  }, [planos, custos])

  if (loading) {
    return (
      <section className="space-y-4 print:hidden">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Rentabilidade por Plano</h2>
          <p className="text-muted-foreground">Visualize o ganho estimado para cada plano VIVA</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-[320px] w-full rounded-xl" />
          ))}
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="space-y-4 print:hidden">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Rentabilidade por Plano</h2>
          <p className="text-muted-foreground">Visualize o ganho estimado para cada plano VIVA</p>
        </div>
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <AlertCircle className="h-10 w-10 text-destructive mb-4" />
            <p className="text-lg font-medium text-destructive mb-4">{error}</p>
            <Button onClick={loadData} variant="outline">
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </section>
    )
  }

  if (planStats.length === 0) {
    return (
      <section className="space-y-4 print:hidden">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Rentabilidade por Plano</h2>
          <p className="text-muted-foreground">Visualize o ganho estimado para cada plano VIVA</p>
        </div>
        <Card className="border-dashed bg-muted/50">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
            <p>Nenhum plano configurado.</p>
            <Button asChild variant="link" className="mt-2">
              <Link to="/configuracoes/planos">Configurar Planos</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    )
  }

  return (
    <section className="space-y-4 print:hidden">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Rentabilidade por Plano</h2>
        <p className="text-muted-foreground">Visualize o ganho estimado para cada plano VIVA</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {planStats.map((stat) => (
          <Card
            key={stat.id}
            className="flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">{stat.nome_plano}</CardTitle>
              <CardDescription>
                {stat.duracao_meses} {stat.duracao_meses === 1 ? 'mês' : 'meses'}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-4 space-y-4 flex-grow">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Valor do Plano</div>
                <div className="text-3xl font-bold text-primary">
                  {formatCurrency(stat.valor_plano || 0)}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-sm text-muted-foreground flex justify-between">
                  <span>Prolabore Médico ({stat.prolabore_medico_percentual || 0}%):</span>
                  <span className="font-medium text-foreground">
                    {formatCurrency(stat.prolabore)}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground flex justify-between">
                  <span>Custo Equipe:</span>
                  <span className="font-medium text-foreground">
                    {formatCurrency(stat.custoEquipe)}
                  </span>
                </div>
              </div>

              <Separator className="my-2" />

              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Saldo Líquido</div>
                <div
                  className={cn(
                    'text-2xl font-bold',
                    stat.saldoLiquido >= 0 ? 'text-[#10b981]' : 'text-destructive',
                  )}
                >
                  {formatCurrency(stat.saldoLiquido)}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Margem:</span>
                <span
                  className={cn(
                    'text-lg font-bold',
                    stat.margem >= 0 ? 'text-[#10b981]' : 'text-destructive',
                  )}
                >
                  {stat.margem.toFixed(1)}%
                </span>
              </div>
            </CardContent>
            <CardFooter className="pt-0 flex gap-2">
              <Button asChild variant="outline" size="sm" className="w-full text-xs">
                <Link to="/configuracoes/planos">
                  <FileEdit className="mr-2 h-3 w-3" /> Editar Plano
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="w-full text-xs">
                <Link to="/configuracoes/custos-equipe">
                  <Users className="mr-2 h-3 w-3" /> Editar Custos
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  )
}
