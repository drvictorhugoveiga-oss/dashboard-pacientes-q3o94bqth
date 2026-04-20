import { Badge } from '@/components/ui/badge'
import { PatientStatus, PlanType } from '@/types/patient'
import { cn } from '@/lib/utils'

export function PatientStatusBadge({ status }: { status: PatientStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'font-medium border-0',
        status === 'Ativo' &&
          'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        status === 'Inativo' && 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
        status === 'Vencido' && 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      )}
    >
      {status}
    </Badge>
  )
}

export function PlanBadge({ plan }: { plan: PlanType }) {
  return (
    <Badge variant={plan === 'Sem plano' ? 'secondary' : 'default'} className="font-medium">
      {plan}
    </Badge>
  )
}
