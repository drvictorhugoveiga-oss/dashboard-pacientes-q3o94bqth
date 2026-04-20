import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Index from './pages/Index'
import PatientForm from './pages/PatientForm'
import NotFound from './pages/NotFound'
import Layout from './components/Layout'
import { PatientsProvider } from '@/stores/patients-store'

const App = () => (
  <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
    <TooltipProvider>
      <PatientsProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/pacientes/novo" element={<PatientForm />} />
            <Route path="/pacientes/editar/:id" element={<PatientForm />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </PatientsProvider>
    </TooltipProvider>
  </BrowserRouter>
)

export default App
