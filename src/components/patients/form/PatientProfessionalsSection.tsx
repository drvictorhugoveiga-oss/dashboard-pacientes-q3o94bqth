import { useFieldArray, UseFormReturn } from 'react-hook-form'
import { Trash2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FormField, FormItem, FormControl, FormMessage, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PatientFormValues } from '@/schemas/patient-schema'

export function PatientProfessionalsSection({ form }: { form: UseFormReturn<PatientFormValues> }) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'professionals',
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
        <div>
          <h3 className="text-lg font-medium leading-none tracking-tight">
            Profissionais e Sessões
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Adicione os serviços previstos no plano.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() =>
            append({
              profissional: 'Médico',
              tipoSessao: 'Consulta',
              valorSessao: 0,
              frequencia: 'Semanal',
            })
          }
        >
          <Plus className="h-4 w-4 mr-2" /> Adicionar profissional
        </Button>
      </div>

      <div className="space-y-4 mt-4">
        {fields.length > 0 && (
          <div className="hidden md:grid grid-cols-[1fr_1fr_120px_1fr_auto] gap-4 px-4 pb-2 text-sm font-medium text-muted-foreground border-b">
            <div>Profissional</div>
            <div>Tipo de sessão</div>
            <div>Valor (R$)</div>
            <div>Frequência</div>
            <div className="w-9"></div>
          </div>
        )}

        {fields.map((field, index) => (
          <div
            key={field.id}
            className="grid grid-cols-1 md:grid-cols-[1fr_1fr_120px_1fr_auto] gap-4 items-start border p-4 rounded-md bg-card shadow-sm md:border-transparent md:shadow-none md:p-0 md:bg-transparent relative animate-in fade-in slide-in-from-top-2"
          >
            <FormField
              control={form.control}
              name={`professionals.${index}.profissional`}
              render={({ field: f }) => (
                <FormItem>
                  <FormLabel className="md:hidden">Profissional</FormLabel>
                  <Select onValueChange={f.onChange} defaultValue={f.value} value={f.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[
                        'Médico',
                        'Nutricionista',
                        'Enfermeira',
                        'Fonoaudióloga',
                        'Psicóloga',
                        'Fisioterapeuta',
                      ].map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
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
              name={`professionals.${index}.tipoSessao`}
              render={({ field: f }) => (
                <FormItem>
                  <FormLabel className="md:hidden">Tipo</FormLabel>
                  <Select onValueChange={f.onChange} defaultValue={f.value} value={f.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {['Consulta', 'Avaliação', 'Acompanhamento', 'Retorno'].map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
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
              name={`professionals.${index}.valorSessao`}
              render={({ field: f }) => (
                <FormItem>
                  <FormLabel className="md:hidden">Valor (R$)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min="0" placeholder="0.00" {...f} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`professionals.${index}.frequencia`}
              render={({ field: f }) => (
                <FormItem>
                  <FormLabel className="md:hidden">Frequência</FormLabel>
                  <Select onValueChange={f.onChange} defaultValue={f.value} value={f.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Frequência" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {['Semanal', 'Quinzenal', 'Mensal', 'Conforme demanda'].map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center md:pt-0 pt-2 md:justify-center justify-end">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
                onClick={() => remove(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        {fields.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8 bg-muted/30 border border-dashed rounded-md">
            Nenhum profissional adicionado. Clique no botão acima para adicionar ao plano.
          </p>
        )}
      </div>
    </div>
  )
}
