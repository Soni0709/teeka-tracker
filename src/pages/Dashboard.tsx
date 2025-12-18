import { useNavigate } from 'react-router-dom'
import { LogOut, Stethoscope } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import type { UserProfile } from '@/types'

interface DashboardProps {
  userProfile: UserProfile | null
}

export default function Dashboard({ userProfile }: DashboardProps) {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-emerald-500 shadow-lg">
              <Stethoscope className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">TeekaSetu</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Welcome, <span className="font-medium text-foreground">{userProfile?.name || 'User'}</span>
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">Dashboard</h1>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Placeholder cards */}
          {['Total Vaccinations', 'This Week', 'Coverage Rate', 'Pending'].map((title, i) => (
            <div key={i} className="p-6 rounded-xl bg-card border border-border">
              <p className="text-sm text-muted-foreground mb-1">{title}</p>
              <p className="text-2xl font-bold text-foreground">--</p>
            </div>
          ))}
        </div>

        <div className="mt-8 p-8 rounded-xl bg-card border border-border text-center">
          <p className="text-muted-foreground">Dashboard content coming soon...</p>
        </div>
      </main>
    </div>
  )
}
