import { Badge } from '@/components/ui/badge'
import { PlanStatus, PlanType } from '@/types/patient'

export function PatientStatusBadge({ status }: { status: PlanStatus }) {
  if (status === 'Ativo') {
    return (
      <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-transparent">
        Ativo
      </Badge>
    )
  }
  if (status === 'Vencido') {
    return <Badge variant="destructive">Vencido</Badge>
  }
  return (
    <Badge
      variant="secondary"
      className="bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300"
    >
      Inativo
    </Badge>
  )
}

export function PlanBadge({ plan }: { plan: PlanType }) {
  if (!plan) return <span className="text-muted-foreground text-sm">-</span>

  return (
    <Badge variant="outline" className="font-medium bg-primary/5 text-primary border-primary/20">
      {plan}
    </Badge>
  )
}
