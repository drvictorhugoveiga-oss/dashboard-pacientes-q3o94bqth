import { Patient } from '@/types/patient'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Eye, Pencil, User, Calendar, Activity } from 'lucide-react'
import { PatientStatusBadge, PlanBadge } from './PatientStatusBadge'
import { formatDate } from '@/lib/date-utils'

interface PatientCardsProps {
  patients: Patient[]
  onViewDetails: (patient: Patient) => void
  onEdit: (patient: Patient) => void
}

export function PatientCards({ patients, onViewDetails, onEdit }: PatientCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:hidden animate-fade-in-up">
      {patients.map((patient) => (
        <Card key={patient.id} className="overflow-hidden shadow-sm transition-all hover:shadow-md">
          <CardHeader className="pb-3 pt-5 px-5 flex flex-row items-start justify-between space-y-0">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <User className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg font-semibold">{patient.name}</CardTitle>
            </div>
            <PatientStatusBadge status={patient.status} />
          </CardHeader>
          <CardContent className="px-5 pb-4 space-y-3 text-sm">
            <div className="flex items-center text-muted-foreground">
              <Calendar className="mr-2 h-4 w-4" />
              Nasc:{' '}
              <span className="ml-1 text-foreground font-medium">
                {formatDate(patient.birthDate)}
              </span>
            </div>
            <div className="flex items-center text-muted-foreground">
              <Activity className="mr-2 h-4 w-4" />
              Plano:{' '}
              <span className="ml-1">
                <PlanBadge plan={patient.plan} />
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t mt-2">
              <div>
                <p className="text-xs text-muted-foreground">Início</p>
                <p className="font-medium">{formatDate(patient.startDate)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Término</p>
                <p className="font-medium">{formatDate(patient.endDate)}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="px-5 py-3 bg-muted/30 border-t flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => onViewDetails(patient)}>
              <Eye className="mr-2 h-4 w-4" /> Detalhes
            </Button>
            <Button variant="secondary" size="sm" onClick={() => onEdit(patient)}>
              <Pencil className="mr-2 h-4 w-4" /> Editar
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
