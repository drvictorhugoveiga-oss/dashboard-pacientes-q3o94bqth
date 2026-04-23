import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Patient } from '@/types/patient'
import { getPacientes } from '@/services/pacientes'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'

interface PatientsContextType {
  patients: Patient[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

const PatientsContext = createContext<PatientsContextType | undefined>(undefined)

export const usePatientsStore = () => {
  const context = useContext(PatientsContext)
  if (!context) throw new Error('usePatientsStore must be used within a PatientsProvider')
  return context
}

export const PatientsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth()
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = async () => {
    if (!user) {
      setPatients([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const data = await getPacientes()
      setPatients(data)
      setError(null)
    } catch (err: any) {
      console.error(err)
      setError('Ocorreu um erro ao carregar os dados')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [user])

  useRealtime(
    'pacientes',
    () => {
      loadData()
    },
    !!user,
  )

  useRealtime(
    'planos_pacientes',
    () => {
      loadData()
    },
    !!user,
  )

  return (
    <PatientsContext.Provider value={{ patients, loading, error, refetch: loadData }}>
      {children}
    </PatientsContext.Provider>
  )
}
