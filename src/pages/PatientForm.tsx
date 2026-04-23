import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form } from '@/components/ui/form'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/hooks/use-auth'
import {
  createPacienteCompleto,
  getPacienteCompleto,
  updatePacienteCompleto,
} from '@/services/pacientes'
import { patientSchema, PatientFormValues } from '@/schemas/patient-schema'
import { extractFieldErrors } from '@/lib/pocketbase/errors'
import { PatientPersonalSection } from '@/components/patients/form/PatientPersonalSection'
import { PatientPlanSection } from '@/components/patients/form/PatientPlanSection'
import { PatientProfessionalsSection } from '@/components/patients/form/PatientProfessionalsSection'
import { PatientFormSkeleton } from '@/components/patients/PatientSkeletons'
import { usePatientsStore } from '@/stores/patients-store'
import { AlertCircle } from 'lucide-react'

export default function PatientForm() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEditMode = Boolean(id)
  const { user } = useAuth()
  const { refetch } = usePatientsStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(isEditMode)
  const [error, setError] = useState(false)

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: '',
      birthDate: '',
      phone: '',
      email: '',
      address: '',
      plan: '3 meses',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      status: 'Ativo',
      professionals: [],
    },
  })

  const startDate = form.watch('startDate')
  const planType = form.watch('plan')
  const professionals = form.watch('professionals')

  const loadData = async () => {
    if (!id) return
    setIsLoading(true)
    setError(false)
    try {
      const data = await getPacienteCompleto(id)
      const birthDateStr = data.paciente.data_nascimento
        ? data.paciente.data_nascimento.substring(0, 10)
        : ''
      const startDateStr = data.plano?.data_inicio ? data.plano.data_inicio.substring(0, 10) : ''
      const endDateStr = data.plano?.data_termino ? data.plano.data_termino.substring(0, 10) : ''

      form.reset({
        name: data.paciente.nome,
        birthDate: birthDateStr,
        phone: data.paciente.telefone || '',
        email: data.paciente.email || '',
        address: data.paciente.endereco || '',
        plan: data.plano?.tipo_plano ? (data.plano.tipo_plano as any) : 'Sem plano',
        startDate: startDateStr || new Date().toISOString().split('T')[0],
        endDate: endDateStr,
        status: data.plano?.status ? (data.plano.status as any) : 'Ativo',
        professionals: data.profissionais.map((p) => ({
          profissional: p.profissional,
          tipoSessao: p.tipo_sessao,
          valorSessao: p.valor_sessao,
          frequencia: p.frequencia,
        })) as any[],
      })
    } catch (e) {
      console.error(e)
      setError(true)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [id])

  useEffect(() => {
    if (startDate && planType && planType !== 'Sem plano') {
      const date = new Date(startDate + 'T12:00:00Z')
      const months = parseInt(planType.charAt(0))
      date.setMonth(date.getMonth() + months)
      form.setValue('endDate', date.toISOString().split('T')[0], { shouldValidate: true })
    } else if (planType === 'Sem plano') {
      form.setValue('endDate', '')
    }
  }, [startDate, planType, form])

  const { totalSessions, totalMargin } = useMemo(() => {
    let sessions = 0
    let margin = 0
    const months = planType && planType !== 'Sem plano' ? parseInt(planType.charAt(0)) : 0

    professionals.forEach((p) => {
      let s = 0
      if (p.frequencia === 'Semanal') s = 4 * months
      else if (p.frequencia === 'Quinzenal') s = 2 * months
      else if (p.frequencia === 'Mensal') s = 1 * months
      else if (p.frequencia === 'Conforme demanda') s = 1
      sessions += s
      margin += s * (Number(p.valorSessao) || 0)
    })
    return { totalSessions: sessions, totalMargin: margin }
  }, [professionals, planType])

  const onSubmit = async (data: PatientFormValues) => {
    if (!user?.id) return toast.error('Sua sessão expirou.')
    setIsSubmitting(true)
    try {
      if (isEditMode && id) {
        await updatePacienteCompleto(id, data, user.id, totalMargin)
        toast.success('Paciente atualizado com sucesso!')
      } else {
        await createPacienteCompleto(data, user.id, totalMargin)
        toast.success('Paciente criado com sucesso!')
      }
      refetch()
      navigate('/')
    } catch (error) {
      console.error(error)
      const fieldErrors = extractFieldErrors(error)
      if (Object.keys(fieldErrors).length > 0) {
        Object.entries(fieldErrors).forEach(([field, msg]) => {
          let formField: any = field
          if (field === 'nome') formField = 'name'
          if (field === 'data_nascimento') formField = 'birthDate'
          if (field === 'telefone') formField = 'phone'
          if (field === 'endereco') formField = 'address'

          form.setError(formField, { type: 'server', message: msg as string })
        })
        toast.error('Erro de validação. Verifique os campos.')
      } else {
        toast.error('Erro ao salvar paciente. Verifique os dados e tente novamente.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <PatientFormSkeleton />
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 animate-in fade-in zoom-in duration-300">
        <div className="bg-destructive/10 p-4 rounded-full">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        <p className="text-lg text-foreground font-medium max-w-[300px]">
          Erro ao carregar dados do paciente. Por favor, tente novamente.
        </p>
        <Button onClick={loadData} variant="outline" className="mt-2">
          Tentar novamente
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {isEditMode ? 'Editar Paciente' : 'Novo Paciente'}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isEditMode
            ? 'Edite os dados pessoais, configure o plano e vincule os profissionais.'
            : 'Cadastre os dados pessoais, configure o plano e vincule os profissionais.'}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Dados Pessoais</CardTitle>
            </CardHeader>
            <CardContent>
              <PatientPersonalSection form={form} />
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Plano Skip</CardTitle>
            </CardHeader>
            <CardContent>
              <PatientPlanSection form={form} />
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <PatientProfessionalsSection form={form} />
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6">
                <div>
                  <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
                    Sessões Previstas
                  </p>
                  <p className="text-4xl font-bold mt-1 text-foreground">{totalSessions}</p>
                </div>
                <Separator orientation="vertical" className="hidden sm:block h-16 bg-primary/20" />
                <div className="sm:text-right w-full sm:w-auto">
                  <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
                    Margem Estimada
                  </p>
                  <p className="text-4xl font-bold text-primary mt-1">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                      totalMargin,
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/')}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="min-w-[150px]">
              {isSubmitting ? 'Salvando...' : isEditMode ? 'Atualizar Paciente' : 'Criar Paciente'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
