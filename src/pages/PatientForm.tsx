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
import { PatientVivaPlanSection } from '@/components/patients/form/PatientVivaPlanSection'
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
      vivaPlanId: '',
      vivaStartDate: '',
      vivaEndDate: '',
      vivaStatus: 'Ativo',
    },
  })

  const loadData = async () => {
    if (!id) return
    setIsLoading(true)
    setError(false)
    try {
      const data = await getPacienteCompleto(id)
      const birthDateStr = data.paciente.data_nascimento
        ? data.paciente.data_nascimento.substring(0, 10)
        : ''

      form.reset({
        name: data.paciente.nome,
        birthDate: birthDateStr,
        phone: data.paciente.telefone || '',
        email: data.paciente.email || '',
        address: data.paciente.endereco || '',
        vivaPlanId: data.planoViva?.plano_viva_id || '',
        vivaStartDate: data.planoViva?.data_inicio
          ? data.planoViva.data_inicio.substring(0, 10)
          : '',
        vivaEndDate: data.planoViva?.data_termino
          ? data.planoViva.data_termino.substring(0, 10)
          : '',
        vivaStatus: data.planoViva?.status || 'Ativo',
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

  const onSubmit = async (data: PatientFormValues) => {
    if (!user?.id) return toast.error('Sua sessão expirou.')
    setIsSubmitting(true)
    try {
      if (isEditMode && id) {
        await updatePacienteCompleto(id, data, user.id)
        toast.success('Paciente atualizado com sucesso!')
      } else {
        await createPacienteCompleto(data, user.id)
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
              <CardTitle>Plano VIVA</CardTitle>
            </CardHeader>
            <CardContent>
              <PatientVivaPlanSection form={form} />
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
