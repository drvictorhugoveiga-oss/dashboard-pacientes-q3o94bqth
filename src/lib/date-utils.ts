import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function formatDate(dateString?: string) {
  if (!dateString) return '-'
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString
    return format(date, 'dd/MM/yyyy', { locale: ptBR })
  } catch (error) {
    return '-'
  }
}

export function formatFullDate(dateString?: string) {
  if (!dateString) return '-'
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString
    return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
  } catch (error) {
    return '-'
  }
}
