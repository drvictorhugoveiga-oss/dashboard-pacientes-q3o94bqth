import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Index from './pages/Index'
import PatientForm from './pages/PatientForm'
import Reminders from './pages/Reminders'
import NotFound from './pages/NotFound'
import Layout from './components/Layout'
import { PatientsProvider } from '@/stores/patients-store'
import { AuthProvider } from '@/hooks/use-auth'
import Login from './pages/Login'
import { ProtectedRoute } from './components/ProtectedRoute'

const App = () => (
  <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
    <TooltipProvider>
      <AuthProvider>
        <PatientsProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<Index />} />
                <Route path="/pacientes/novo" element={<PatientForm />} />
                <Route path="/pacientes/editar/:id" element={<PatientForm />} />
                <Route path="/lembretes" element={<Reminders />} />
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </PatientsProvider>
      </AuthProvider>
    </TooltipProvider>
  </BrowserRouter>
)

export default App
