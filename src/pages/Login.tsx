import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Users, Loader2 } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const { error: signInError } = await signIn(email, password)

    if (signInError) {
      setError('Email ou senha inválidos. Tente novamente.')
      setIsLoading(false)
    } else {
      navigate(from, { replace: true })
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
      <Card className="w-full max-w-sm shadow-lg border-primary/10">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <div className="bg-primary text-primary-foreground p-3 rounded-xl shadow-sm">
              <Users className="h-6 w-6" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Skip Health</CardTitle>
          <CardDescription>Acesse seu dashboard de pacientes</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20 animate-fade-in">
                {error}
              </div>
            )}
            <div className="space-y-2 text-left">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nome@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="focus-visible:ring-primary"
              />
            </div>
            <div className="space-y-2 text-left">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="focus-visible:ring-primary"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full shadow-sm active:scale-95 transition-transform"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Entrar no sistema'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
