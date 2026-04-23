import { Patient } from '@/types/patient'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { PatientStatusBadge, PlanBadge } from './PatientStatusBadge'
import { formatFullDate } from '@/lib/date-utils'
import { User, Calendar, Activity, CalendarDays, SeparatorHorizontal } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

interface PatientDetailsDialogProps {
  patient: Patient | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PatientDetailsDialog({ patient, open, onOpenChange }: PatientDetailsDialogProps) {
  if (!patient) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <User className="h-5 w-5" />
            </div>
            {patient.name}
          </DialogTitle>
          <DialogDescription>
            Detalhes completos do perfil e status do plano VIVA.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Status Atual</span>
            <PatientStatusBadge status={patient.vivaStatus} />
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <User className="h-4 w-4 text-primary" /> Informações Pessoais
            </h4>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Data de Nascimento:</span>
                <span className="font-medium">{formatFullDate(patient.birthDate)}</span>
              </div>
              {patient.phone && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Telefone:</span>
                  <span className="font-medium">{patient.phone}</span>
                </div>
              )}
              {patient.email && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{patient.email}</span>
                </div>
              )}
              {patient.address && (
                <div className="flex flex-col gap-1 mt-1">
                  <span className="text-muted-foreground">Endereço:</span>
                  <span className="font-medium text-right">{patient.address}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" /> Detalhes do Plano VIVA
            </h4>
            <div className="grid grid-cols-1 gap-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Plano Selecionado:</span>
                <PlanBadge plan={patient.vivaPlanName || ''} />
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Data de Início:</span>
                <span className="font-medium">{formatFullDate(patient.vivaStartDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Data de Término:</span>
                <span className="font-medium">{formatFullDate(patient.vivaEndDate)}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
