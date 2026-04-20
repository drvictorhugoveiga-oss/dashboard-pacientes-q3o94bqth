import { Patient } from '@/types/patient'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Eye, Pencil, User } from 'lucide-react'
import { PatientStatusBadge, PlanBadge } from './PatientStatusBadge'
import { formatDate } from '@/lib/date-utils'

interface PatientTableProps {
  patients: Patient[]
  onViewDetails: (patient: Patient) => void
  onEdit: (patient: Patient) => void
}

export function PatientTable({ patients, onViewDetails, onEdit }: PatientTableProps) {
  return (
    <div className="hidden md:block rounded-lg border bg-card shadow-sm overflow-hidden animate-fade-in-up">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead>Nome do paciente</TableHead>
            <TableHead>Nascimento</TableHead>
            <TableHead>Plano Skip</TableHead>
            <TableHead>Início</TableHead>
            <TableHead>Término</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.map((patient) => (
            <TableRow
              key={patient.id}
              className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-900 duration-200"
            >
              <TableCell className="font-medium">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <User className="h-4 w-4" />
                  </div>
                  {patient.name}
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(patient.birthDate)}
              </TableCell>
              <TableCell>
                <PlanBadge plan={patient.plan} />
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(patient.startDate)}
              </TableCell>
              <TableCell className="text-muted-foreground">{formatDate(patient.endDate)}</TableCell>
              <TableCell>
                <PatientStatusBadge status={patient.status} />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onViewDetails(patient)}
                    title="Ver detalhes"
                  >
                    <Eye className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(patient)}
                    title="Editar"
                  >
                    <Pencil className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
