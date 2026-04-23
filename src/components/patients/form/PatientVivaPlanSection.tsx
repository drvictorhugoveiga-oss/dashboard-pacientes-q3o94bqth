import { useEffect, useState } from 'react'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { UseFormReturn } from 'react-hook-form'
import { PatientFormValues } from '@/schemas/patient-schema'
import pb from '@/lib/pocketbase/client'

export function PatientVivaPlanSection({ form }: { form: UseFormReturn<PatientFormValues> }) {
  const [planosViva, setPlanosViva] = useState<any[]>([])

  useEffect(() => {
    pb.collection('planos_viva_config')
      .getFullList()
      .then(setPlanosViva)
      .catch(() => {})
  }, [])

  const selectedPlanId = form.watch('vivaPlanId')
  const isSemPlano = !selectedPlanId || selectedPlanId === ''
  const startDate = form.watch('vivaStartDate')

  useEffect(() => {
    if (selectedPlanId && startDate) {
      const plan = planosViva.find((p) => p.id === selectedPlanId)
      if (plan) {
        const date = new Date(startDate + 'T12:00:00Z')
        date.setMonth(date.getMonth() + plan.duracao_meses)
        form.setValue('vivaEndDate', date.toISOString().split('T')[0], { shouldValidate: true })
      }
    } else if (isSemPlano) {
      form.setValue('vivaEndDate', '')
    }
  }, [selectedPlanId, startDate, planosViva, form, isSemPlano])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="vivaPlanId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Plano VIVA (Opcional)</FormLabel>
            <Select
              onValueChange={(val) => field.onChange(val === 'none' ? '' : val)}
              value={field.value || 'none'}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um Plano VIVA" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="none">Sem Plano VIVA</SelectItem>
                {planosViva
                  .filter((p) => p.id && p.id.trim() !== '')
                  .map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nome_plano} ({p.duracao_meses} meses - R$ {p.valor_plano})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="vivaStatus"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Status VIVA</FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value || 'Ativo'}
              disabled={isSemPlano}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="Ativo">Ativo</SelectItem>
                <SelectItem value="Inativo">Inativo</SelectItem>
                <SelectItem value="Vencido">Vencido</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="vivaStartDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Data de Início VIVA</FormLabel>
            <FormControl>
              <Input
                type="date"
                disabled={isSemPlano}
                value={field.value || ''}
                onChange={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="vivaEndDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Data de Término VIVA</FormLabel>
            <FormControl>
              <Input
                type="date"
                readOnly
                className="bg-muted text-muted-foreground cursor-not-allowed"
                value={field.value || ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
