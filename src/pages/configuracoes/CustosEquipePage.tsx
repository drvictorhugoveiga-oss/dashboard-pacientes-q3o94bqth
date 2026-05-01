import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, AlertCircle, Info } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface Plan {
  id: string
  nome_plano: string
}

interface CostRecord {
  id?: string
  plano_viva_id: string
  profissional: string
  valor_sessao: number
  quantidade_sessoes: number
  isDirty?: boolean
  isSaving?: boolean
}

const PROFISSIONAIS = [
  'Psicóloga',
  'Fisioterapeuta',
  'Nutricionista',
  'Fonoaudióloga',
  'Enfermeira',
  'Médico',
]

const MOCK_VIVA_2: Record<string, { v: number; q: number }> = {
  Psicóloga: { v: 250, q: 4 },
  Fisioterapeuta: { v: 150, q: 4 },
  Nutricionista: { v: 450, q: 1 },
  Fonoaudióloga: { v: 168, q: 0 },
  Enfermeira: { v: 0, q: 0 },
  Médico: { v: 0, q: 0 },
}

export default function CustosEquipePage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [plans, setPlans] = useState<Plan[]>([])
  const [selectedPlanId, setSelectedPlanId] = useState<string>('')
  const [costs, setCosts] = useState<CostRecord[]>([])
  const [isLoadingPlans, setIsLoadingPlans] = useState(true)
  const [isLoadingCosts, setIsLoadingCosts] = useState(false)
  const [isError, setIsError] = useState(false)

  const [pendingPlanId, setPendingPlanId] = useState<string | null>(null)
  const [showGuardDialog, setShowGuardDialog] = useState(false)

  const hasUnsavedChanges = costs.some((c) => c.isDirty)

  const loadPlans = async () => {
    try {
      setIsError(false)
      const data = await pb
        .collection('planos_viva_config')
        .getFullList<Plan>({ sort: 'nome_plano' })
      setPlans(data)
      if (data.length > 0) {
        setSelectedPlanId(data[0].id)
      }
    } catch (err) {
      console.error(err)
      setIsError(true)
    } finally {
      setIsLoadingPlans(false)
    }
  }

  useEffect(() => {
    loadPlans()
  }, [])

  const loadCostsForPlan = async (planId: string) => {
    if (!planId) return
    setIsLoadingCosts(true)
    setIsError(false)
    try {
      const data = await pb.collection('custos_equipe_config').getFullList<CostRecord>({
        filter: `plano_viva_id="${planId}"`,
      })

      const planName = plans.find((p) => p.id === planId)?.nome_plano || ''
      const isViva2 = planName.toUpperCase().includes('VIVA 2')

      const merged = PROFISSIONAIS.map((prof) => {
        const found = data.find((d) => d.profissional === prof)
        if (found) {
          return { ...found, isDirty: false, isSaving: false }
        }

        let defV = 0
        let defQ = 0
        if (isViva2 && MOCK_VIVA_2[prof]) {
          defV = MOCK_VIVA_2[prof].v
          defQ = MOCK_VIVA_2[prof].q
        }

        return {
          plano_viva_id: planId,
          profissional: prof,
          valor_sessao: defV,
          quantidade_sessoes: defQ,
          isDirty: false,
          isSaving: false,
        }
      })

      setCosts(merged)
    } catch (err) {
      console.error(err)
      setIsError(true)
    } finally {
      setIsLoadingCosts(false)
    }
  }

  useEffect(() => {
    if (selectedPlanId) {
      loadCostsForPlan(selectedPlanId)
    }
  }, [selectedPlanId])

  const handlePlanChange = (newPlanId: string) => {
    if (hasUnsavedChanges) {
      setPendingPlanId(newPlanId)
      setShowGuardDialog(true)
    } else {
      setSelectedPlanId(newPlanId)
    }
  }

  const confirmPlanChange = () => {
    setShowGuardDialog(false)
    if (pendingPlanId) {
      setSelectedPlanId(pendingPlanId)
      setPendingPlanId(null)
    }
  }

  const cancelPlanChange = () => {
    setShowGuardDialog(false)
    setPendingPlanId(null)
  }

  const handleFieldChange = (
    index: number,
    field: 'valor_sessao' | 'quantidade_sessoes',
    value: string,
  ) => {
    setCosts((prev) => {
      const updated = [...prev]
      const numVal = parseFloat(value) || 0

      let finalVal = numVal
      if (field === 'valor_sessao') {
        finalVal = Math.min(Math.max(finalVal, 0), 1000)
      } else if (field === 'quantidade_sessoes') {
        finalVal = Math.min(Math.max(Math.floor(finalVal), 0), 52)
      }

      updated[index] = {
        ...updated[index],
        [field]: finalVal,
        isDirty: true,
      }
      return updated
    })
  }

  const handleSaveRow = async (index: number) => {
    const cost = costs[index]
    if (!user) return

    setCosts((prev) => {
      const u = [...prev]
      u[index].isSaving = true
      return u
    })

    try {
      const payload = {
        user: user.id,
        plano_viva_id: cost.plano_viva_id,
        profissional: cost.profissional,
        valor_sessao: cost.valor_sessao,
        quantidade_sessoes: cost.quantidade_sessoes,
      }

      let savedRecord
      if (cost.id) {
        savedRecord = await pb.collection('custos_equipe_config').update(cost.id, payload)
      } else {
        savedRecord = await pb.collection('custos_equipe_config').create(payload)
      }

      setCosts((prev) => {
        const u = [...prev]
        u[index] = { ...u[index], ...savedRecord, isDirty: false, isSaving: false }
        return u
      })
      toast.success('Custos atualizados com sucesso!')
    } catch (err) {
      console.error(err)
      toast.error('Erro ao salvar. Tente novamente.')
      setCosts((prev) => {
        const u = [...prev]
        u[index].isSaving = false
        return u
      })
    }
  }

  if (isLoadingPlans) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto p-4 md:p-0">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-20 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate(-1)}
          title="Voltar"
          className="hidden sm:flex shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(-1)}
              className="sm:hidden h-8 w-8 shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Configurações de Custos da Equipe</h1>
          </div>
          <p className="text-muted-foreground mt-1 max-w-3xl">
            Edite os valores de sessão e quantidade de sessões por profissional. As alterações
            refletem automaticamente em todo o dashboard.
          </p>
        </div>
      </div>

      {!isError ? (
        <>
          <div className="bg-card p-4 rounded-lg border shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <span className="text-sm font-medium whitespace-nowrap">Selecione um plano:</span>
            <Select value={selectedPlanId} onValueChange={handlePlanChange}>
              <SelectTrigger className="w-full sm:w-[300px]">
                <SelectValue placeholder="Selecione um plano" />
              </SelectTrigger>
              <SelectContent>
                {plans.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.nome_plano}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoadingCosts ? (
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {costs.length === 0 && !isLoadingCosts && (
                <div className="text-center p-8 bg-muted/20 rounded-lg border border-dashed">
                  <p className="text-muted-foreground">
                    Nenhum profissional configurado para este plano.
                  </p>
                </div>
              )}

              {/* Desktop Table */}
              <div className="hidden md:block rounded-lg border shadow-sm bg-card overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="px-4 py-3 font-medium">Profissional</th>
                      <th className="px-4 py-3 font-medium w-40">Valor da Sessão (R$)</th>
                      <th className="px-4 py-3 font-medium w-40">Qtd. Sessões</th>
                      <th className="px-4 py-3 font-medium w-40">Subtotal</th>
                      <th className="px-4 py-3 font-medium text-right w-32">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {costs.map((cost, idx) => {
                      const isMedico = cost.profissional === 'Médico'
                      const subtotal = cost.valor_sessao * cost.quantidade_sessoes

                      return (
                        <tr
                          key={idx}
                          className={cn(
                            'hover:bg-muted/20 transition-colors',
                            cost.isDirty && 'bg-primary/5',
                          )}
                        >
                          <td className="px-4 py-3 font-medium flex items-center gap-2">
                            {cost.profissional}
                            {isMedico && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>já contabilizado no prolabore</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <Input
                              type="number"
                              value={cost.valor_sessao}
                              onChange={(e) =>
                                handleFieldChange(idx, 'valor_sessao', e.target.value)
                              }
                              disabled={isMedico}
                              className="h-8 w-full font-mono"
                              min={0}
                              max={1000}
                              step="0.01"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <Input
                              type="number"
                              value={cost.quantidade_sessoes}
                              onChange={(e) =>
                                handleFieldChange(idx, 'quantidade_sessoes', e.target.value)
                              }
                              disabled={isMedico}
                              className="h-8 w-full font-mono"
                              min={0}
                              max={52}
                            />
                          </td>
                          <td className="px-4 py-3 font-medium text-primary font-mono">
                            R$ {subtotal.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {!isMedico && (
                              <Button
                                size="sm"
                                variant={cost.isDirty ? 'default' : 'outline'}
                                disabled={!cost.isDirty || cost.isSaving}
                                onClick={() => handleSaveRow(idx)}
                              >
                                {cost.isSaving ? 'Salvando...' : 'Salvar'}
                              </Button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="grid grid-cols-1 gap-4 md:hidden">
                {costs.map((cost, idx) => {
                  const isMedico = cost.profissional === 'Médico'
                  const subtotal = cost.valor_sessao * cost.quantidade_sessoes

                  return (
                    <div
                      key={idx}
                      className={cn(
                        'bg-card border rounded-lg p-4 shadow-sm space-y-4',
                        cost.isDirty && 'border-primary/50 ring-1 ring-primary/20',
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          {cost.profissional}
                          {isMedico && <Info className="h-4 w-4 text-muted-foreground" />}
                        </h3>
                        {!isMedico && (
                          <Button
                            size="sm"
                            variant={cost.isDirty ? 'default' : 'outline'}
                            disabled={!cost.isDirty || cost.isSaving}
                            onClick={() => handleSaveRow(idx)}
                          >
                            <Save className="h-4 w-4 mr-2" />
                            {cost.isSaving ? '...' : 'Salvar'}
                          </Button>
                        )}
                      </div>

                      {isMedico ? (
                        <p className="text-sm text-muted-foreground">
                          Valores já contabilizados no prolabore médico.
                        </p>
                      ) : (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs text-muted-foreground font-medium">
                              Valor (R$)
                            </label>
                            <Input
                              type="number"
                              value={cost.valor_sessao}
                              onChange={(e) =>
                                handleFieldChange(idx, 'valor_sessao', e.target.value)
                              }
                              className="h-9 font-mono"
                              min={0}
                              max={1000}
                              step="0.01"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs text-muted-foreground font-medium">
                              Qtd. Sessões
                            </label>
                            <Input
                              type="number"
                              value={cost.quantidade_sessoes}
                              onChange={(e) =>
                                handleFieldChange(idx, 'quantidade_sessoes', e.target.value)
                              }
                              className="h-9 font-mono"
                              min={0}
                              max={52}
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between items-center pt-2 border-t mt-2">
                        <span className="text-sm text-muted-foreground font-medium">Subtotal</span>
                        <span className="font-bold text-primary font-mono">
                          R$ {subtotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 bg-destructive/5 rounded-lg border border-destructive/20 text-center">
          <AlertCircle className="h-10 w-10 text-destructive mb-4" />
          <h3 className="text-lg font-semibold text-destructive mb-2">Erro ao carregar dados</h3>
          <p className="text-muted-foreground mb-6">
            Não foi possível carregar as informações. Verifique sua conexão.
          </p>
          <Button
            onClick={() => {
              loadPlans()
              loadCostsForPlan(selectedPlanId)
            }}
            variant="outline"
          >
            Tentar novamente
          </Button>
        </div>
      )}

      <AlertDialog open={showGuardDialog} onOpenChange={setShowGuardDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Atenção</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja salvar as alterações antes de trocar de plano? As modificações não salvas serão
              perdidas se você continuar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelPlanChange}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmPlanChange}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Continuar sem salvar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
