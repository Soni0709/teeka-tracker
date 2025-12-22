import { useState, useEffect } from 'react'
import { RefreshCw, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { TrendData, VaccineTypeStats, DistrictStats, AgeGroupStats } from '@/types'

// API
import { 
  getDashboardStats, 
  getVaccinationTrend,
  getVaccinationByVaccineType,
  getVaccinationByDistrict,
  getVaccinationByAgeGroup,
  type DashboardSummary,
  type DashboardFilterParams
} from '@/lib/api'

// Components
import {
  StatsCards,
  VaccinationTrendChart,
  VaccineTypeChart,
  AgeGroupChart,
  DistrictCoverage,
  RecentVaccinationsTable,
  DashboardFilters,
  defaultFilters,
  type FilterValues
} from '@/components/dashboard'

import { AddVaccinationModal } from '@/components/forms'

// Helper to convert FilterValues to API params
function getApiFilters(filters: FilterValues): DashboardFilterParams {
  const apiFilters: DashboardFilterParams = {}
  if (filters.startDate) apiFilters.startDate = filters.startDate
  if (filters.endDate) apiFilters.endDate = filters.endDate
  if (filters.district_id) apiFilters.district_id = filters.district_id
  if (filters.vaccine_type_id) apiFilters.vaccine_type_id = filters.vaccine_type_id
  return apiFilters
}

export default function Dashboard() {
  // State
  const [stats, setStats] = useState<DashboardSummary | null>(null)
  const [trendData, setTrendData] = useState<TrendData[]>([])
  const [vaccineStats, setVaccineStats] = useState<VaccineTypeStats[]>([])
  const [districtStats, setDistrictStats] = useState<DistrictStats[]>([])
  const [ageGroupStats, setAgeGroupStats] = useState<AgeGroupStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filter state
  const [filters, setFilters] = useState<FilterValues>(defaultFilters)
  
  // Modal state
  const [showAddVaccination, setShowAddVaccination] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  // Create stable filter key for useEffect dependency
  const filterKey = JSON.stringify(filters)

  // Fetch all dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)
      setError(null)
      
      const apiFilters = getApiFilters(filters)
      const hasFilters = Object.keys(apiFilters).length > 0
      
      try {
        const [
          dashboardStats,
          trend,
          byVaccine,
          byDistrict,
          byAgeGroup
        ] = await Promise.all([
          getDashboardStats(hasFilters ? apiFilters : undefined),
          getVaccinationTrend(7, hasFilters ? apiFilters : undefined),
          getVaccinationByVaccineType(hasFilters ? apiFilters : undefined),
          getVaccinationByDistrict(hasFilters ? apiFilters : undefined),
          getVaccinationByAgeGroup(hasFilters ? apiFilters : undefined)
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

    fetchDashboardData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey, refreshKey])

  const handleVaccinationAdded = () => {
    setRefreshKey(prev => prev + 1)
  }

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilters(newFilters)
  }

  const handleFilterReset = () => {
    setFilters(defaultFilters)
  }

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  const currentApiFilters = getApiFilters(filters)

  return (
    <div>
      {/* Page Title */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of vaccination program</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            size="sm" 
            className="bg-gradient-to-r from-blue-600 to-emerald-500 hover:opacity-90"
            onClick={() => setShowAddVaccination(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Vaccination
          </Button>
        </div>
      </div>

      {/* Filters */}
      <DashboardFilters
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleFilterReset}
      />

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={handleRefresh}
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
        <RecentVaccinationsTable 
          key={`${refreshKey}-${filterKey}`} 
          initialLimit={10} 
          filters={currentApiFilters}
        />
      </div>

      {/* Add Vaccination Modal */}
      <AddVaccinationModal 
        isOpen={showAddVaccination}
        onClose={() => setShowAddVaccination(false)}
        onSuccess={handleVaccinationAdded}
      />
    </div>
  )
}
