import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Patient } from '@/types/patient'

interface PatientsContextType {
  patients: Patient[]
  loading: boolean
  addPatient: (patient: Omit<Patient, 'id'>) => void
  updatePatient: (id: string, data: Partial<Patient>) => void
  deletePatient: (id: string) => void
}

const initialMockData: Patient[] = [
  {
    id: '1',
    name: 'João Silva',
    birthDate: '1960-03-15',
    plan: '3 meses',
    startDate: '2024-01-01',
    endDate: '2024-04-01',
    status: 'Ativo',
  },
  {
    id: '2',
    name: 'Maria Santos',
    birthDate: '1955-07-22',
    plan: '6 meses',
    startDate: '2023-12-10',
    endDate: '2024-06-10',
    status: 'Ativo',
  },
  {
    id: '3',
    name: 'Carlos Oliveira',
    birthDate: '1950-11-10',
    plan: 'Sem plano',
    startDate: '',
    endDate: '',
    status: 'Inativo',
  },
]

const PatientsContext = createContext<PatientsContextType | undefined>(undefined)

export function PatientsProvider({ children }: { children: ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate network delay
    const timer = setTimeout(() => {
      setPatients(initialMockData)
      setLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  const addPatient = (patientData: Omit<Patient, 'id'>) => {
    const newPatient: Patient = {
      ...patientData,
      id: Math.random().toString(36).substring(7),
    }
    setPatients((prev) => [...prev, newPatient])
  }

  const updatePatient = (id: string, data: Partial<Patient>) => {
    setPatients((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)))
  }

  const deletePatient = (id: string) => {
    setPatients((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <PatientsContext.Provider
      value={{ patients, loading, addPatient, updatePatient, deletePatient }}
    >
      {children}
    </PatientsContext.Provider>
  )
}

export function usePatientsStore() {
  const context = useContext(PatientsContext)
  if (context === undefined) {
    throw new Error('usePatientsStore must be used within a PatientsProvider')
  }
  return context
}
