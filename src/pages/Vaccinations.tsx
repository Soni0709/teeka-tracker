import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, RefreshCw, Filter, X, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AddVaccinationModal } from '@/components/forms'
import { 
  VaccinationTable, 
  ViewVaccinationModal, 
  DeleteVaccinationModal 
} from '@/components/vaccinations'
import { 
  getVaccinations, 
  getDistricts,
  getVaccineTypes,
  type VaccinationWithDetails, 
  type VaccinationFilters,
  type District
} from '@/lib/api'
import type { VaccineType } from '@/types'

export default function Vaccinations() {
  // Data state
  const [vaccinations, setVaccinations] = useState<VaccinationWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  // Filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [districtFilter, setDistrictFilter] = useState('')
  const [vaccineFilter, setVaccineFilter] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  
  // Master data
  const [districts, setDistricts] = useState<District[]>([])
  const [vaccineTypes, setVaccineTypes] = useState<VaccineType[]>([])

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedVaccination, setSelectedVaccination] = useState<VaccinationWithDetails | null>(null)

  // Load master data
  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    loadMasterData()
  }, [])

  const loadMasterData = async () => {
    const [districtsData, vaccinesData] = await Promise.all([
      getDistricts(),
      getVaccineTypes()
    ])
    setDistricts(districtsData)
    setVaccineTypes(vaccinesData)
  }

  // Load vaccinations
  const loadVaccinations = useCallback(async () => {
    setLoading(true)
    
    const filters: VaccinationFilters = {}
    if (searchTerm) filters.search = searchTerm
    if (districtFilter) filters.district_id = districtFilter
    if (vaccineFilter) filters.vaccine_type_id = vaccineFilter
    if (startDate) filters.start_date = startDate
    if (endDate) filters.end_date = endDate

    const result = await getVaccinations(page, 10, filters)
    
    setVaccinations(result.data)
    setTotalPages(result.totalPages)
    setTotal(result.total)
    setLoading(false)
  }, [page, searchTerm, districtFilter, vaccineFilter, startDate, endDate])

  useEffect(() => {
    loadVaccinations()
  }, [loadVaccinations])

  // Handlers
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    loadVaccinations()
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    setDistrictFilter('')
    setVaccineFilter('')
    setStartDate('')
    setEndDate('')
    setPage(1)
  }

  const handleView = (vaccination: VaccinationWithDetails) => {
    setSelectedVaccination(vaccination)
    setShowViewModal(true)
  }

  const handleDelete = (vaccination: VaccinationWithDetails) => {
    setSelectedVaccination(vaccination)
    setShowDeleteModal(true)
  }

  const handleSuccess = () => {
    loadVaccinations()
  }

  const handleExport = () => {
    // Create CSV content
    const headers = ['Date', 'Beneficiary', 'Age', 'Gender', 'Vaccine', 'Dose', 'District', 'Block', 'Village', 'Batch']
    const rows = vaccinations.map(v => [
      v.date_given,
      v.beneficiary_name,
      v.beneficiary_dob,
      v.beneficiary_gender,
      v.vaccine_name,
      v.dose_number,
      v.district_name,
      v.block_name,
      v.village,
      v.batch_number
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell || ''}"`).join(','))
    ].join('\n')

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `vaccinations_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const hasActiveFilters = searchTerm || districtFilter || vaccineFilter || startDate || endDate

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Vaccinations</h1>
          <p className="text-muted-foreground mt-1">View and manage vaccination records</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExport}
            disabled={loading || vaccinations.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => loadVaccinations()}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            size="sm" 
            className="bg-gradient-to-r from-blue-600 to-emerald-500 hover:opacity-90"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Vaccination
          </Button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by beneficiary name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </form>

          {/* Filter Toggle */}
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
            className={hasActiveFilters ? 'border-primary text-primary' : ''}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <span className="ml-2 px-1.5 py-0.5 text-xs bg-primary text-white rounded-full">
                {[searchTerm, districtFilter, vaccineFilter, startDate, endDate].filter(Boolean).length}
              </span>
            )}
          </Button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="p-4 bg-card border border-border rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-foreground">Filters</h3>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Clear all
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* District Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">District</label>
                <select
                  value={districtFilter}
                  onChange={(e) => {
                    setDistrictFilter(e.target.value)
                    setPage(1)
                  }}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">All Districts</option>
                  {districts.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              {/* Vaccine Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Vaccine Type</label>
                <select
                  value={vaccineFilter}
                  onChange={(e) => {
                    setVaccineFilter(e.target.value)
                    setPage(1)
                  }}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">All Vaccines</option>
                  {vaccineTypes.map(v => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
              </div>

              {/* Start Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">From Date</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value)
                    setPage(1)
                  }}
                />
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">To Date</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value)
                    setPage(1)
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats Summary */}
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          {total} vaccination records found
          {hasActiveFilters && ' (filtered)'}
        </p>
      </div>

      {/* Table */}
      <VaccinationTable
        data={vaccinations}
        loading={loading}
        page={page}
        totalPages={totalPages}
        total={total}
        onPageChange={setPage}
        onView={handleView}
        onDelete={handleDelete}
      />

      {/* Modals */}
      <AddVaccinationModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleSuccess}
      />

      <ViewVaccinationModal
        isOpen={showViewModal}
        vaccination={selectedVaccination}
        onClose={() => setShowViewModal(false)}
      />

      <DeleteVaccinationModal
        isOpen={showDeleteModal}
        vaccination={selectedVaccination}
        onClose={() => setShowDeleteModal(false)}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
