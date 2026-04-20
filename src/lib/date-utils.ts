import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function formatDate(dateString: string | undefined): string {
  if (!dateString) return '-'
  try {
    return format(parseISO(dateString), 'dd/MM/yyyy', { locale: ptBR })
  } catch (error) {
    return '-'
  }
}

export function formatFullDate(dateString: string | undefined): string {
  if (!dateString) return '-'
  try {
    return format(parseISO(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
  } catch (error) {
    return '-'
  }
}
