import { useState, useEffect } from 'react'
import {
  getLembretes,
  getLembretesSummary,
  updateLembreteStatus,
  postponeLembrete,
  Lembrete,
} from '@/services/lembretes'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Calendar } from '@/components/ui/calendar'
import {
  CalendarIcon,
  BellIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  RotateCwIcon,
  FilterIcon,
} from 'lucide-react'
import { useRealtime } from '@/hooks/use-realtime'
import { Skeleton } from '@/components/ui/skeleton'

function PostponeDialog({
  lembreteId,
  currentData,
  onPostpone,
}: {
  lembreteId: string
  currentData: string
  onPostpone: (id: string, d: Date) => void
}) {
  const [date, setDate] = useState<Date | undefined>(new Date(currentData))
  const [open, setOpen] = useState(false)

  const handleConfirm = () => {
    if (date) {
      onPostpone(lembreteId, date)
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 w-full sm:w-auto">
          <ClockIcon className="h-4 w-4" /> Adiar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adiar para qual data?</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center py-4">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
            locale={ptBR}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!date}>
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function Reminders() {
  const [lembretes, setLembretes] = useState<Lembrete[]>([])
  const [summary, setSummary] = useState({ pendentes: 0, contatadosEsteMes: 0, naoRespondidos: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const { toast } = useToast()

  const [statusFilter, setStatusFilter] = useState('Todos')
  const [profFilter, setProfFilter] = useState('Todos')
  const [dateFilter, setDateFilter] = useState('Todos')
  const [debouncedFilters, setDebouncedFilters] = useState({
    status: 'Todos',
    profissional: 'Todos',
    dataRange: 'Todos',
  })

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilters({ status: statusFilter, profissional: profFilter, dataRange: dateFilter })
    }, 300)
    return () => clearTimeout(handler)
  }, [statusFilter, profFilter, dateFilter])

  const loadData = async () => {
    setLoading(true)
    setError(false)
    try {
      const [data, summ] = await Promise.all([
        getLembretes(debouncedFilters),
        getLembretesSummary(),
      ])
      setLembretes(data)
      setSummary(summ)
    } catch (err) {
      setError(true)
      toast({
        title: 'Erro',
        description: 'Falha ao carregar os lembretes.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [debouncedFilters])

  useRealtime('lembretes', () => {
    loadData()
  })

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await updateLembreteStatus(id, newStatus)
      toast({ title: 'Sucesso', description: `Lembrete marcado como ${newStatus}.` })
    } catch (err) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status.',
        variant: 'destructive',
      })
    }
  }

  const handlePostpone = async (id: string, newDate: Date) => {
    try {
      await postponeLembrete(id, newDate)
      toast({ title: 'Sucesso', description: 'Lembrete adiado com sucesso.' })
    } catch (err) {
      toast({
        title: 'Erro',
        description: 'Não foi possível adiar o lembrete.',
        variant: 'destructive',
      })
    }
  }

  const resetFilters = () => {
    setStatusFilter('Todos')
    setProfFilter('Todos')
    setDateFilter('Todos')
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pendente':
        return (
          <Badge
            variant="destructive"
            className="bg-red-100 text-red-800 hover:bg-red-200 border-red-200"
          >
            Pendente
          </Badge>
        )
      case 'Contatado':
        return (
          <Badge
            variant="secondary"
            className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200"
          >
            Contatado
          </Badge>
        )
      case 'Não respondeu':
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200"
          >
            Não respondeu
          </Badge>
        )
      default:
        return <Badge>{status}</Badge>
    }
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <p className="text-muted-foreground">Ocorreu um erro ao carregar os dados.</p>
        <Button onClick={loadData}>
          <RotateCwIcon className="mr-2 h-4 w-4" /> Tentar novamente
        </Button>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lembretes</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os contatos e acompanhamentos dos pacientes.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendentes</CardTitle>
            <BellIcon className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-3xl font-bold text-red-600">{summary.pendentes}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contatados este mês</CardTitle>
            <CheckCircleIcon className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-3xl font-bold text-green-600">{summary.contatadosEsteMes}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Não respondidos</CardTitle>
            <XCircleIcon className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-3xl font-bold text-yellow-600">{summary.naoRespondidos}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-end sm:items-center">
          <div className="w-full sm:w-auto space-y-1.5 flex-1">
            <label className="text-xs font-medium text-muted-foreground">Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos</SelectItem>
                <SelectItem value="Pendente">Pendente</SelectItem>
                <SelectItem value="Contatado">Contatado</SelectItem>
                <SelectItem value="Não respondeu">Não respondeu</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:w-auto space-y-1.5 flex-1">
            <label className="text-xs font-medium text-muted-foreground">Profissional</label>
            <Select value={profFilter} onValueChange={setProfFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos</SelectItem>
                <SelectItem value="Médico">Médico</SelectItem>
                <SelectItem value="Nutricionista">Nutricionista</SelectItem>
                <SelectItem value="Enfermeira">Enfermeira</SelectItem>
                <SelectItem value="Fonoaudióloga">Fonoaudióloga</SelectItem>
                <SelectItem value="Psicóloga">Psicóloga</SelectItem>
                <SelectItem value="Fisioterapeuta">Fisioterapeuta</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:w-auto space-y-1.5 flex-1">
            <label className="text-xs font-medium text-muted-foreground">Período</label>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos</SelectItem>
                <SelectItem value="Esta semana">Esta semana</SelectItem>
                <SelectItem value="Este mês">Este mês</SelectItem>
                <SelectItem value="Próximos 7 dias">Próximos 7 dias</SelectItem>
                <SelectItem value="Próximos 30 dias">Próximos 30 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="ghost" onClick={resetFilters} className="w-full sm:w-auto h-10 shrink-0">
            <FilterIcon className="h-4 w-4 mr-2" /> Limpar filtros
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))
        ) : lembretes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center border rounded-xl bg-muted/20">
            <CheckCircleIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium">Nenhum lembrete encontrado</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Tente ajustar os filtros ou aproveite o dia livre!
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {lembretes.map((l) => (
              <Card key={l.id} className="overflow-hidden transition-all hover:shadow-md">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row md:items-center justify-between p-4 gap-4">
                    <div className="flex flex-col sm:flex-row gap-4 sm:items-center flex-1">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <UserIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold text-base">
                            {l.expand?.paciente?.nome || 'Paciente Desconhecido'}
                          </span>
                          {getStatusBadge(l.status)}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Badge variant="outline" className="font-normal">
                              {l.profissional}
                            </Badge>
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="text-xs uppercase tracking-wider font-semibold opacity-70">
                              Tipo:
                            </span>{' '}
                            {l.tipo_contato}
                          </span>
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="h-3.5 w-3.5" />{' '}
                            {format(parseISO(l.data_prevista), "dd 'de' MMMM, yyyy", {
                              locale: ptBR,
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 md:justify-end shrink-0 border-t md:border-t-0 pt-4 md:pt-0">
                      {(l.status === 'Pendente' || l.status === 'Não respondeu') && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(l.id, 'Contatado')}
                          className="gap-2 w-full sm:w-auto bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircleIcon className="h-4 w-4" /> Contatado
                        </Button>
                      )}

                      {l.status === 'Pendente' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(l.id, 'Não respondeu')}
                          className="gap-2 w-full sm:w-auto text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                        >
                          <XCircleIcon className="h-4 w-4" /> Não respondeu
                        </Button>
                      )}

                      {l.status === 'Não respondeu' && (
                        <PostponeDialog
                          lembreteId={l.id}
                          currentData={l.data_prevista}
                          onPostpone={handlePostpone}
                        />
                      )}

                      {l.status === 'Pendente' && (
                        <PostponeDialog
                          lembreteId={l.id}
                          currentData={l.data_prevista}
                          onPostpone={handlePostpone}
                        />
                      )}

                      {l.status === 'Contatado' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled
                          className="gap-2 w-full sm:w-auto"
                        >
                          <CheckCircleIcon className="h-4 w-4 text-green-500" /> Finalizado
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
