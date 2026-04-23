import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Settings,
  Bell,
  ChevronRight,
  LogOut,
  CalendarDays,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/hooks/use-auth'
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  SidebarHeader,
} from '@/components/ui/sidebar'

export function AppSidebar() {
  const location = useLocation()
  const menuItems = [
    { title: 'Dashboard', icon: LayoutDashboard, url: '/' },
    { title: 'Pacientes', icon: Users, url: '/' },
    { title: 'Sessões', icon: CalendarDays, url: '/sessoes' },
    { title: 'Configurações', icon: Settings, url: '#' },
  ]

  return (
    <Sidebar variant="inset">
      <SidebarHeader className="px-6 py-5 border-b border-sidebar-border/50">
        <div className="flex items-center gap-2 font-bold text-xl text-primary tracking-tight">
          <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
            <Users className="h-5 w-5" />
          </div>
          Skip Health
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="pt-4">
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url && item.url !== '#'}
                  >
                    <Link
                      to={item.url}
                      className="flex items-center gap-3 px-4 py-2 text-sm font-medium transition-all"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const isForm = location.pathname.includes('/novo') || location.pathname.includes('/editar')

  const handleLogout = () => {
    signOut()
    navigate('/login')
  }

  const initials = user?.name ? user.name.substring(0, 2).toUpperCase() : 'DR'

  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex flex-col flex-1 min-w-0 bg-background/50">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b bg-background/80 backdrop-blur-md px-4 shadow-sm md:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="flex flex-1 items-center gap-2 text-sm text-muted-foreground font-medium">
            <Link to="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link
              to="/"
              className={!isForm ? 'text-foreground' : 'hover:text-foreground transition-colors'}
            >
              Pacientes
            </Link>
            {isForm && (
              <>
                <ChevronRight className="h-4 w-4" />
                <span className="text-foreground">
                  {location.pathname.includes('/novo') ? 'Novo Paciente' : 'Editar Paciente'}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground relative"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background"></span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-8 w-8 ring-2 ring-border cursor-pointer hover:ring-primary transition-all">
                  <AvatarImage
                    src="https://img.usecurling.com/ppl/thumbnail?gender=female&seed=4"
                    alt={user?.name || 'Doctor'}
                  />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-8 animate-fade-in">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
