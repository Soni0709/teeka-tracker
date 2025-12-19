import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ThemeToggle'
import { supabase } from '@/lib/supabase'
import Logo from '@/components/common/Logo'
import type { UserProfile } from '@/types'

// API
import { 
  getDashboardStats, 
  type DashboardSummary 
} from '@/lib/api'

// Components
import StatsCards from '@/components/dashboard/StatsCards'

interface DashboardProps {
  userProfile: UserProfile | null
}

export default function Dashboard({ userProfile }: DashboardProps) {
  const navigate = useNavigate()
  
  // State
  const [stats, setStats] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const dashboardStats = await getDashboardStats()
      
      if (dashboardStats) {
        setStats(dashboardStats)
      } else {
        setError('Failed to load dashboard data')
      }
    } catch (err) {
      console.error('Error fetching dashboard:', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Logo size="md" clickable={false} />

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <span className="text-sm text-muted-foreground hidden sm:inline">
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
        {/* Page Title */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Overview of vaccination program</p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchDashboardData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={fetchDashboardData}
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Loading State */}
        {loading && !stats && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 rounded-xl bg-card border border-border animate-pulse">
                <div className="p-6">
                  <div className="h-4 w-24 bg-muted rounded mb-4"></div>
                  <div className="h-8 w-16 bg-muted rounded"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Cards */}
        {stats && (
          <StatsCards
            totalVaccinations={stats.total_vaccinations}
            weekCount={stats.week_count}
            todayCount={stats.today_count}
            monthCount={stats.month_count}
          />
        )}

        {/* Placeholder for Charts */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="p-8 rounded-xl bg-card border border-border text-center">
            <p className="text-muted-foreground">📈 Vaccination Trend Chart - Coming Next</p>
          </div>
          <div className="p-8 rounded-xl bg-card border border-border text-center">
            <p className="text-muted-foreground">🍩 By Vaccine Type Chart - Coming Next</p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="p-8 rounded-xl bg-card border border-border text-center">
            <p className="text-muted-foreground">📊 By Age Group Chart - Coming Next</p>
          </div>
          <div className="p-8 rounded-xl bg-card border border-border text-center">
            <p className="text-muted-foreground">🗺️ District Coverage - Coming Next</p>
          </div>
        </div>

        {/* Placeholder for Recent Vaccinations */}
        <div className="mt-6 p-8 rounded-xl bg-card border border-border text-center">
          <p className="text-muted-foreground">📋 Recent Vaccinations Table - Coming Next</p>
        </div>
      </main>
    </div>
  )
}
