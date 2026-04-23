import { useEffect, useState } from 'react'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/use-auth'

export default function ConfiguracoesVivaPage() {
  const { user } = useAuth()
  const [planos, setPlanos] = useState<any[]>([])
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const [custos, setCustos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadPlanos = async () => {
    try {
      const data = await pb.collection('planos_viva_config').getFullList({ sort: 'valor_plano' })
      setPlanos(data)
      if (data.length > 0 && !selectedPlanId) setSelectedPlanId(data[0].id)
    } catch (err) {
      console.error(err)
      toast.error('Erro ao carregar planos VIVA')
    } finally {
      setLoading(false)
    }
  }

  const loadCustos = async () => {
    if (!selectedPlanId) return
    try {
      const data = await pb.collection('custos_equipe_config').getFullList({
        filter: `plano_viva_id="${selectedPlanId}"`,
        sort: 'profissional',
      })

      const profissoes = [
        'Médico',
        'Nutricionista',
        'Enfermeira',
        'Fonoaudióloga',
        'Psicóloga',
        'Fisioterapeuta',
      ]
      const merged = profissoes.map((prof) => {
        const found = data.find((d) => d.profissional === prof)
        return found || { profissional: prof, valor_sessao: 0, quantidade_sessoes: 0, isNew: true }
      })
      setCustos(merged)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadPlanos()
  }, [])

  useEffect(() => {
    loadCustos()
  }, [selectedPlanId])

  const handleSavePlan = async (plano: any) => {
    try {
      if (!user) return
      if (plano.id) {
        await pb.collection('planos_viva_config').update(plano.id, plano)
      } else {
        const newPlan = await pb
          .collection('planos_viva_config')
          .create({ ...plano, user: user.id })
        setSelectedPlanId(newPlan.id)
      }
      toast.success('Plano salvo com sucesso')
      loadPlanos()
    } catch (err) {
      toast.error('Erro ao salvar plano')
    }
  }

  const handleSaveCusto = async (custo: any) => {
    try {
      if (!user || !selectedPlanId) return
      if (custo.id) {
        await pb.collection('custos_equipe_config').update(custo.id, {
          valor_sessao: Number(custo.valor_sessao),
          quantidade_sessoes: Number(custo.quantidade_sessoes),
        })
      } else {
        await pb.collection('custos_equipe_config').create({
          user: user.id,
          plano_viva_id: selectedPlanId,
          profissional: custo.profissional,
          valor_sessao: Number(custo.valor_sessao),
          quantidade_sessoes: Number(custo.quantidade_sessoes),
        })
      }
      toast.success('Custo salvo com sucesso')
      loadCustos()
    } catch (err) {
      toast.error('Erro ao salvar custo')
    }
  }

  if (loading) return <div className="p-8 text-center text-muted-foreground">Carregando...</div>

  const selectedPlan = planos.find((p) => p.id === selectedPlanId)

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações Planos VIVA</h1>
        <p className="text-muted-foreground">
          Gerencie as regras de negócio, preços e comissões dos planos VIVA.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Planos Disponíveis</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex flex-col">
                {planos.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPlanId(p.id)}
                    className={`p-4 text-left border-b hover:bg-muted/50 transition-colors ${selectedPlanId === p.id ? 'bg-primary/10 border-l-4 border-l-primary' : ''}`}
                  >
                    <div className="font-medium">{p.nome_plano}</div>
                    <div className="text-sm text-muted-foreground">
                      R$ {p.valor_plano} • {p.duracao_meses} meses
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          {selectedPlan && (
            <Card>
              <CardHeader>
                <CardTitle>Detalhes do Plano: {selectedPlan.nome_plano}</CardTitle>
                <CardDescription>
                  Defina o valor base e a porcentagem de pro-labore médico.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label>Duração (Meses)</Label>
                    <Input
                      type="number"
                      value={selectedPlan.duracao_meses}
                      onChange={(e) => {
                        const updated = [...planos]
                        const idx = updated.findIndex((p) => p.id === selectedPlan.id)
                        updated[idx].duracao_meses = Number(e.target.value)
                        setPlanos(updated)
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Valor Base (R$)</Label>
                    <Input
                      type="number"
                      value={selectedPlan.valor_plano}
                      onChange={(e) => {
                        const updated = [...planos]
                        const idx = updated.findIndex((p) => p.id === selectedPlan.id)
                        updated[idx].valor_plano = Number(e.target.value)
                        setPlanos(updated)
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Pró-labore Médico (%)</Label>
                    <Input
                      type="number"
                      value={selectedPlan.prolabore_medico_percentual}
                      onChange={(e) => {
                        const updated = [...planos]
                        const idx = updated.findIndex((p) => p.id === selectedPlan.id)
                        updated[idx].prolabore_medico_percentual = Number(e.target.value)
                        setPlanos(updated)
                      }}
                    />
                  </div>
                </div>
                <Button onClick={() => handleSavePlan(selectedPlan)}>
                  Salvar Alterações do Plano
                </Button>
              </CardContent>
            </Card>
          )}

          {selectedPlan && (
            <Card>
              <CardHeader>
                <CardTitle>Custos da Equipe: {selectedPlan.nome_plano}</CardTitle>
                <CardDescription>
                  Defina as sessões e valores pagos aos profissionais por este plano.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Profissional</TableHead>
                      <TableHead>Qtd. Sessões</TableHead>
                      <TableHead>Valor por Sessão (R$)</TableHead>
                      <TableHead>Total (R$)</TableHead>
                      <TableHead className="text-right">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {custos.map((custo, idx) => {
                      const total =
                        (Number(custo.quantidade_sessoes) || 0) * (Number(custo.valor_sessao) || 0)
                      return (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">{custo.profissional}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              className="w-24"
                              value={custo.quantidade_sessoes}
                              onChange={(e) => {
                                const updated = [...custos]
                                updated[idx].quantidade_sessoes = e.target.value
                                setCustos(updated)
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              className="w-32"
                              value={custo.valor_sessao}
                              onChange={(e) => {
                                const updated = [...custos]
                                updated[idx].valor_sessao = e.target.value
                                setCustos(updated)
                              }}
                            />
                          </TableCell>
                          <TableCell>R$ {total.toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSaveCusto(custo)}
                            >
                              Salvar
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
