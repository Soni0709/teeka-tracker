/* eslint-disable react-refresh/only-export-components */
import { useState, useEffect } from 'react'
import { Filter, X, Calendar, MapPin, Syringe, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getVaccineTypes, getDistricts } from '@/lib/api'
import type { VaccineType, District } from '@/types'

export interface FilterValues {
  dateRange: 'all' | 'today' | 'week' | 'month' | 'custom'
  startDate: string
  endDate: string
  district_id: string
  vaccine_type_id: string
}

interface DashboardFiltersProps {
  filters: FilterValues
  onChange: (filters: FilterValues) => void
  onReset: () => void
}

export const defaultFilters: FilterValues = {
  dateRange: 'all',
  startDate: '',
  endDate: '',
  district_id: '',
  vaccine_type_id: ''
}

export default function DashboardFilters({ filters, onChange, onReset }: DashboardFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [vaccineTypes, setVaccineTypes] = useState<VaccineType[]>([])
  const [districts, setDistricts] = useState<District[]>([])

  // Fetch filter options
  useEffect(() => {
    const fetchOptions = async () => {
      const [vaccines, dists] = await Promise.all([
        getVaccineTypes(),
        getDistricts()
      ])
      setVaccineTypes(vaccines)
      setDistricts(dists)
    }
    fetchOptions()
  }, [])

  const handleChange = (key: keyof FilterValues, value: string) => {
    const newFilters = { ...filters, [key]: value }
    
    // Handle date range presets
    if (key === 'dateRange') {
      const today = new Date()
      switch (value) {
        case 'today':
          newFilters.startDate = today.toISOString().split('T')[0]
          newFilters.endDate = today.toISOString().split('T')[0]
          break
        case 'week':
          { const weekAgo = new Date(today)
          weekAgo.setDate(weekAgo.getDate() - 7)
          newFilters.startDate = weekAgo.toISOString().split('T')[0]
          newFilters.endDate = today.toISOString().split('T')[0]
          break }
        case 'month':
          { const monthAgo = new Date(today)
          monthAgo.setDate(monthAgo.getDate() - 30)
          newFilters.startDate = monthAgo.toISOString().split('T')[0]
          newFilters.endDate = today.toISOString().split('T')[0]
          break }
        case 'all':
          newFilters.startDate = ''
          newFilters.endDate = ''
          break
        // 'custom' - keep existing dates
      }
    }
    
    onChange(newFilters)
  }

  const activeFilterCount = [
    filters.dateRange !== 'all',
    filters.district_id,
    filters.vaccine_type_id
  ].filter(Boolean).length

  const handleReset = () => {
    onReset()
    setIsExpanded(false)
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4 mb-6">
      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
        >
          <Filter className="h-4 w-4" />
          <span className="font-medium">Filters</span>
          {activeFilterCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-primary text-primary-foreground rounded-full">
              {activeFilterCount}
            </span>
          )}
        </button>

        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded hover:bg-muted transition-colors"
          >
            <X className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-0' : 'rotate-45'}`} />
          </button>
        </div>
      </div>

      {/* Active Filter Tags */}
      {!isExpanded && activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {filters.dateRange !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-lg">
              <Calendar className="h-3 w-3" />
              {filters.dateRange === 'custom' 
                ? `${filters.startDate} - ${filters.endDate}`
                : filters.dateRange.charAt(0).toUpperCase() + filters.dateRange.slice(1)
              }
              <button onClick={() => handleChange('dateRange', 'all')}>
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {filters.district_id && (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <MapPin className="h-3 w-3" />
              {districts.find(d => d.id === filters.district_id)?.name}
              <button onClick={() => handleChange('district_id', '')}>
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {filters.vaccine_type_id && (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded-lg">
              <Syringe className="h-3 w-3" />
              {vaccineTypes.find(v => v.id === filters.vaccine_type_id)?.name}
              <button onClick={() => handleChange('vaccine_type_id', '')}>
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Date Range */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1 text-sm">
                <Calendar className="h-3.5 w-3.5" />
                Date Range
              </Label>
              <Select
                value={filters.dateRange}
                onChange={(e) => handleChange('dateRange', e.target.value)}
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="custom">Custom Range</option>
              </Select>
            </div>

            {/* Custom Date Range */}
            {filters.dateRange === 'custom' && (
              <>
                <div className="space-y-2">
                  <Label className="text-sm">Start Date</Label>
                  <Input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => handleChange('startDate', e.target.value)}
                    max={filters.endDate || new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">End Date</Label>
                  <Input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => handleChange('endDate', e.target.value)}
                    min={filters.startDate}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </>
            )}

            {/* District */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1 text-sm">
                <MapPin className="h-3.5 w-3.5" />
                District
              </Label>
              <Select
                value={filters.district_id}
                onChange={(e) => handleChange('district_id', e.target.value)}
              >
                <option value="">All Districts</option>
                {districts.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </Select>
            </div>

            {/* Vaccine Type */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1 text-sm">
                <Syringe className="h-3.5 w-3.5" />
                Vaccine Type
              </Label>
              <Select
                value={filters.vaccine_type_id}
                onChange={(e) => handleChange('vaccine_type_id', e.target.value)}
              >
                <option value="">All Vaccines</option>
                {vaccineTypes.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </Select>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
