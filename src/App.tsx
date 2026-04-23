import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Index from './pages/Index'
import PatientForm from './pages/PatientForm'
import PlanosPage from './pages/planos/PlanosPage'
import SessoesPage from './pages/sessoes/SessoesPage'
import Reminders from './pages/Reminders'
import NotFound from './pages/NotFound'
import RelatoriosPage from './pages/relatorios/RelatoriosPage'
import ConfiguracoesVivaPage from './pages/configuracoes/ConfiguracoesVivaPage'
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
                <Route path="/sessoes" element={<SessoesPage />} />
                <Route path="/relatorios" element={<RelatoriosPage />} />
                <Route path="/planos" element={<PlanosPage />} />
                <Route path="/configuracoes-viva" element={<ConfiguracoesVivaPage />} />
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
