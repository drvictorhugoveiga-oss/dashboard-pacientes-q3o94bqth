import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { FilterX } from 'lucide-react'
import type { SessaoFiltersState } from '../types'

interface Props {
  filters: SessaoFiltersState
  onChange: (f: SessaoFiltersState) => void
  onClear: () => void
}

export function SessoesFilters({ filters, onChange, onClear }: Props) {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6 bg-card p-4 rounded-xl border shadow-sm">
      <div className="flex-1">
        <label className="text-sm font-medium mb-1.5 block text-muted-foreground">
          Profissional
        </label>
        <Select
          value={filters.profissional}
          onValueChange={(v) => onChange({ ...filters, profissional: v })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            {[
              'Todos',
              'Médico',
              'Nutricionista',
              'Enfermeira',
              'Fonoaudióloga',
              'Psicóloga',
              'Fisioterapeuta',
            ].map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex-1">
        <label className="text-sm font-medium mb-1.5 block text-muted-foreground">Período</label>
        <Select value={filters.periodo} onValueChange={(v) => onChange({ ...filters, periodo: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            {[
              'Todos',
              'Este mês',
              'Mês anterior',
              'Últimos 3 meses',
              'Últimos 6 meses',
              'Personalizado',
            ].map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex-1">
        <label className="text-sm font-medium mb-1.5 block text-muted-foreground">Status</label>
        <Select value={filters.status} onValueChange={(v) => onChange({ ...filters, status: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            {['Todas', 'Realizada', 'Cancelada', 'Pendente'].map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {filters.periodo === 'Personalizado' && (
        <div className="flex-1 flex gap-2">
          <div className="flex-1">
            <label className="text-sm font-medium mb-1.5 block text-muted-foreground">Início</label>
            <Input
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => onChange({ ...filters, startDate: e.target.value })}
            />
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium mb-1.5 block text-muted-foreground">Fim</label>
            <Input
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => onChange({ ...filters, endDate: e.target.value })}
            />
          </div>
        </div>
      )}
      <div className="flex items-end">
        <Button variant="outline" onClick={onClear} className="w-full md:w-auto">
          <FilterX className="h-4 w-4 mr-2" /> Limpar
        </Button>
      </div>
    </div>
  )
}
