import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { usePatientsStore } from '@/stores/patients-store'
import { useDebounce } from '@/hooks/use-debounce'
import { PatientTable } from '@/components/patients/PatientTable'
import { PatientCards } from '@/components/patients/PatientCards'
import { PatientDetailsDialog } from '@/components/patients/PatientDetailsDialog'
import { TableSkeleton, CardsSkeleton } from '@/components/patients/PatientSkeletons'
import { Patient } from '@/types/patient'

export default function Index() {
  const navigate = useNavigate()
  const { patients, loading, error, refetch } = usePatientsStore()
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const filteredPatients = useMemo(() => {
    if (!debouncedSearchTerm) return patients
    const lower = debouncedSearchTerm.toLowerCase()
    return patients.filter((p) => p.name.toLowerCase().includes(lower))
  }, [patients, debouncedSearchTerm])

  const handleViewDetails = (patient: Patient) => {
    setSelectedPatient(patient)
    setDialogOpen(true)
  }

  const handleEdit = (patient: Patient) => {
    navigate(`/pacientes/editar/${patient.id}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Meus Pacientes</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie e visualize as informações de seus pacientes.
          </p>
        </div>
        <Button
          onClick={() => navigate('/pacientes/novo')}
          className="w-full sm:w-auto shadow-sm active:scale-95 transition-transform"
        >
          <Plus className="mr-2 h-4 w-4" /> Novo Paciente
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar paciente por nome..."
          className="pl-9 bg-card shadow-sm border-border focus-visible:ring-primary"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="space-y-4">
          <TableSkeleton />
          <CardsSkeleton />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-card rounded-lg border shadow-sm border-dashed">
          <div className="bg-destructive/10 p-4 rounded-full mb-4">
            <Users className="h-10 w-10 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold text-destructive">
            Ocorreu um erro ao carregar os dados
          </h3>
          <p className="text-muted-foreground mt-1 mb-6 max-w-sm">{error}</p>
          <Button variant="outline" onClick={refetch}>
            Tentar novamente
          </Button>
        </div>
      ) : filteredPatients.length > 0 ? (
        <div className="space-y-4">
          <PatientTable
            patients={filteredPatients}
            onViewDetails={handleViewDetails}
            onEdit={handleEdit}
          />
          <PatientCards
            patients={filteredPatients}
            onViewDetails={handleViewDetails}
            onEdit={handleEdit}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-card rounded-lg border shadow-sm border-dashed animate-fade-in-up">
          <div className="bg-muted p-4 rounded-full mb-4">
            <Users className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">
            {searchTerm ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado'}
          </h3>
          <p className="text-muted-foreground mt-1 mb-6 max-w-sm">
            {searchTerm
              ? 'Tente ajustar os termos de sua busca.'
              : 'Você ainda não possui pacientes cadastrados. Adicione um novo para começar.'}
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm('')
              if (!searchTerm) navigate('/pacientes/novo')
            }}
          >
            {searchTerm ? 'Limpar busca' : 'Novo Paciente'}
          </Button>
        </div>
      )}

      <PatientDetailsDialog
        patient={selectedPatient}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  )
}
