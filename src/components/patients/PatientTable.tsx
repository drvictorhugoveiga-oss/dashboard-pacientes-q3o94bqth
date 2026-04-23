import { useState } from 'react'
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
import { Eye, Pencil, Trash2, User } from 'lucide-react'
import { PatientStatusBadge, PlanBadge } from './PatientStatusBadge'
import { formatDate } from '@/lib/date-utils'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { deletePaciente } from '@/services/pacientes'
import { toast } from 'sonner'
import { usePatientsStore } from '@/stores/patients-store'
import { getErrorMessage } from '@/lib/pocketbase/errors'

interface PatientTableProps {
  patients: Patient[]
  onViewDetails: (patient: Patient) => void
  onEdit: (patient: Patient) => void
}

export function PatientTable({ patients, onViewDetails, onEdit }: PatientTableProps) {
  const { refetch } = usePatientsStore()
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!patientToDelete) return
    setIsDeleting(true)
    try {
      await deletePaciente(patientToDelete.id)
      toast.success('Paciente removido com sucesso.')
      refetch()
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setIsDeleting(false)
      setPatientToDelete(null)
    }
  }

  return (
    <div className="hidden md:block rounded-lg border bg-card shadow-sm overflow-hidden animate-fade-in-up">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead>Nome do paciente</TableHead>
            <TableHead>Nascimento</TableHead>
            <TableHead>Plano VIVA</TableHead>
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
                <PlanBadge plan={patient.vivaPlanName || ''} />
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(patient.vivaStartDate)}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(patient.vivaEndDate)}
              </TableCell>
              <TableCell>
                <PatientStatusBadge status={patient.vivaStatus} />
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
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setPatientToDelete(patient)}
                    title="Excluir"
                  >
                    <Trash2 className="h-4 w-4 text-destructive hover:text-destructive/80 transition-colors" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog
        open={!!patientToDelete}
        onOpenChange={(open) => !open && setPatientToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o paciente <strong>{patientToDelete?.name}</strong>?
              Esta ação não pode ser desfeita e removerá todos os dados vinculados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
