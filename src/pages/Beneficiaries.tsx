/* eslint-disable react-hooks/immutability */
import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, RefreshCw, Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AddBeneficiaryModal } from '@/components/forms'
import { 
  BeneficiaryTable, 
  ViewEditBeneficiaryModal, 
  DeleteConfirmModal 
} from '@/components/beneficiaries'
import { 
  getBeneficiaries, 
  getDistricts,
  type BeneficiaryWithDetails, 
  type BeneficiaryFilters,
  type District
} from '@/lib/api'

export default function Beneficiaries() {
  // Data state
  const [beneficiaries, setBeneficiaries] = useState<BeneficiaryWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  // Filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [districtFilter, setDistrictFilter] = useState('')
  const [genderFilter, setGenderFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [districts, setDistricts] = useState<District[]>([])

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false)
  const [showViewEditModal, setShowViewEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<BeneficiaryWithDetails | null>(null)
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view')

  // Load districts for filter
  useEffect(() => {
    loadDistricts()
  }, [])

  const loadDistricts = async () => {
    const data = await getDistricts()
    setDistricts(data)
  }

  // Load beneficiaries
  const loadBeneficiaries = useCallback(async () => {
    setLoading(true)
    
    const filters: BeneficiaryFilters = {}
    if (searchTerm) filters.search = searchTerm
    if (districtFilter) filters.district_id = districtFilter
    if (genderFilter) filters.gender = genderFilter

    const result = await getBeneficiaries(page, 10, filters)
    
    setBeneficiaries(result.data)
    setTotalPages(result.totalPages)
    setTotal(result.total)
    setLoading(false)
  }, [page, searchTerm, districtFilter, genderFilter])

  useEffect(() => {
    loadBeneficiaries()
  }, [loadBeneficiaries])

  // Handlers
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    loadBeneficiaries()
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    setDistrictFilter('')
    setGenderFilter('')
    setPage(1)
  }

  const handleView = (beneficiary: BeneficiaryWithDetails) => {
    setSelectedBeneficiary(beneficiary)
    setModalMode('view')
    setShowViewEditModal(true)
  }

  const handleEdit = (beneficiary: BeneficiaryWithDetails) => {
    setSelectedBeneficiary(beneficiary)
    setModalMode('edit')
    setShowViewEditModal(true)
  }

  const handleDelete = (beneficiary: BeneficiaryWithDetails) => {
    setSelectedBeneficiary(beneficiary)
    setShowDeleteModal(true)
  }

  const handleSuccess = () => {
    loadBeneficiaries()
  }

  const hasActiveFilters = searchTerm || districtFilter || genderFilter

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Beneficiaries</h1>
          <p className="text-muted-foreground mt-1">Manage vaccination beneficiaries</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => loadBeneficiaries()}
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
            Add Beneficiary
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
                placeholder="Search by name, guardian or phone..."
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
                {[searchTerm, districtFilter, genderFilter].filter(Boolean).length}
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
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

              {/* Gender Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Gender</label>
                <select
                  value={genderFilter}
                  onChange={(e) => {
                    setGenderFilter(e.target.value)
                    setPage(1)
                  }}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">All Genders</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats Summary */}
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          {total} beneficiaries found
          {hasActiveFilters && ' (filtered)'}
        </p>
      </div>

      {/* Table */}
      <BeneficiaryTable
        data={beneficiaries}
        loading={loading}
        page={page}
        totalPages={totalPages}
        total={total}
        onPageChange={setPage}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Modals */}
      <AddBeneficiaryModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleSuccess}
      />

      <ViewEditBeneficiaryModal
        isOpen={showViewEditModal}
        mode={modalMode}
        beneficiary={selectedBeneficiary}
        onClose={() => setShowViewEditModal(false)}
        onSuccess={handleSuccess}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        beneficiary={selectedBeneficiary}
        onClose={() => setShowDeleteModal(false)}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
