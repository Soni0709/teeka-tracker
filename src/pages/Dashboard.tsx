import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Stethoscope, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ThemeToggle'
import { supabase } from '@/lib/supabase'
import type { UserProfile, TrendData, VaccineTypeStats, DistrictStats, AgeGroupStats } from '@/types'

// API
import { 
  getDashboardStats, 
  getVaccinationTrend,
  getVaccinationByVaccineType,
  getVaccinationByDistrict,
  getVaccinationByAgeGroup,
  type DashboardSummary 
} from '@/lib/api'

// Components
import {
  StatsCards,
  VaccinationTrendChart,
  VaccineTypeChart,
  AgeGroupChart,
  DistrictCoverage,
  RecentVaccinationsTable
} from '@/components/dashboard'

interface DashboardProps {
  userProfile: UserProfile | null
}

export default function Dashboard({ userProfile }: DashboardProps) {
  const navigate = useNavigate()
  
  // State
  const [stats, setStats] = useState<DashboardSummary | null>(null)
  const [trendData, setTrendData] = useState<TrendData[]>([])
  const [vaccineStats, setVaccineStats] = useState<VaccineTypeStats[]>([])
  const [districtStats, setDistrictStats] = useState<DistrictStats[]>([])
  const [ageGroupStats, setAgeGroupStats] = useState<AgeGroupStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Fetch all data in parallel
      const [
        dashboardStats,
        trend,
        byVaccine,
        byDistrict,
        byAgeGroup
      ] = await Promise.all([
        getDashboardStats(),
        getVaccinationTrend(7),
        getVaccinationByVaccineType(),
        getVaccinationByDistrict(),
        getVaccinationByAgeGroup()
      ])
      
      if (dashboardStats) {
        setStats(dashboardStats)
      }
      setTrendData(trend)
      setVaccineStats(byVaccine)
      setDistrictStats(byDistrict)
      setAgeGroupStats(byAgeGroup)
      
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
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-emerald-500 shadow-lg">
              <Stethoscope className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">TeekaSetu</span>
          </div>

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

        {/* Stats Cards */}
        {loading && !stats ? (
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
        ) : stats ? (
          <StatsCards
            totalVaccinations={stats.total_vaccinations}
            weekCount={stats.week_count}
            todayCount={stats.today_count}
            monthCount={stats.month_count}
          />
        ) : null}

        {/* Charts Row 1 */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <VaccinationTrendChart 
            data={trendData} 
            loading={loading && trendData.length === 0} 
          />
          <VaccineTypeChart 
            data={vaccineStats} 
            loading={loading && vaccineStats.length === 0} 
          />
        </div>

        {/* Charts Row 2 */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <AgeGroupChart 
            data={ageGroupStats} 
            loading={loading && ageGroupStats.length === 0} 
          />
          <DistrictCoverage 
            data={districtStats} 
            loading={loading && districtStats.length === 0} 
          />
        </div>

        {/* Recent Vaccinations Table */}
        <div className="mt-6">
          <RecentVaccinationsTable initialLimit={10} />
        </div>
      </main>
    </div>
  )
}
