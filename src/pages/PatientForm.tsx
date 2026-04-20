import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function PatientForm() {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Formulário de Paciente</h1>
          <p className="text-muted-foreground mt-1">Adicione ou edite os dados do paciente.</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Em construção</CardTitle>
          <CardDescription>Esta funcionalidade será implementada em breve.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => navigate(-1)}>Voltar</Button>
        </CardContent>
      </Card>
    </div>
  )
}
