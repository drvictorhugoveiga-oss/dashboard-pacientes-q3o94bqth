import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePatientsStore } from '@/stores/patients-store'
import { PatientTable } from '@/components/patients/PatientTable'
import { PatientCards } from '@/components/patients/PatientCards'
import { PatientDetailsDialog } from '@/components/patients/PatientDetailsDialog'
import { TableSkeleton, CardsSkeleton } from '@/components/patients/PatientSkeletons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, Users, AlertCircle } from 'lucide-react'
import { Patient } from '@/types/patient'
import { useDebounce } from '@/hooks/use-debounce'

export default function Index() {
  const navigate = useNavigate()
  const { patients, loading, error, refetch } = usePatientsStore()
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebounce(searchTerm, 300)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const filteredPatients = useMemo(() => {
    if (!debouncedSearch) return patients
    const lowerSearch = debouncedSearch.toLowerCase()
    return patients.filter((p) => p.name.toLowerCase().includes(lowerSearch))
  }, [patients, debouncedSearch])

  const handleViewDetails = (patient: Patient) => {
    setSelectedPatient(patient)
    setIsDetailsOpen(true)
  }

  const handleEdit = (patient: Patient) => {
    navigate(`/pacientes/editar/${patient.id}`)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meus Pacientes</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie seus pacientes e acompanhe os planos ativos.
          </p>
        </div>
        <Button onClick={() => navigate('/pacientes/novo')} className="w-full sm:w-auto shadow-sm">
          <Plus className="mr-2 h-4 w-4" />
          Novo Paciente
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome do paciente..."
            className="pl-9 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {error ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-card text-card-foreground shadow-sm animate-fade-in-up">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold">Erro ao carregar pacientes</h3>
          <p className="text-muted-foreground mb-4">
            {error || 'Não foi possível carregar a lista de pacientes.'}
          </p>
          <Button onClick={() => refetch()} variant="outline">
            Tentar novamente
          </Button>
        </div>
      ) : loading ? (
        <div className="space-y-4">
          <TableSkeleton />
          <CardsSkeleton />
        </div>
      ) : patients.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-card text-card-foreground shadow-sm animate-fade-in-up">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-4">
            <Users className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Nenhum paciente cadastrado</h3>
          <p className="text-muted-foreground mb-6 max-w-sm">
            Você ainda não possui nenhum paciente cadastrado. Clique no botão abaixo para adicionar
            seu primeiro paciente.
          </p>
          <Button onClick={() => navigate('/pacientes/novo')}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Paciente
          </Button>
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-card text-card-foreground shadow-sm animate-fade-in-up">
          <Search className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum paciente encontrado</h3>
          <p className="text-muted-foreground">
            Não encontramos nenhum paciente com o nome "{searchTerm}".
          </p>
        </div>
      ) : (
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
      )}

      <PatientDetailsDialog
        patient={selectedPatient}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />
    </div>
  )
}
