import { useState, useEffect } from 'react'
import { X, Search, User, Syringe, Calendar, MapPin, FileText, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { 
  getVaccineTypes, 
  getDistricts, 
  getBlocks,
  searchBeneficiaries,
  addVaccination,
  type BeneficiarySearch
} from '@/lib/api'
import type { VaccineType, District, Block } from '@/types'

interface AddVaccinationModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function AddVaccinationModal({ isOpen, onClose, onSuccess }: AddVaccinationModalProps) {
  // Master data
  const [vaccineTypes, setVaccineTypes] = useState<VaccineType[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [blocks, setBlocks] = useState<Block[]>([])
  
  // Beneficiary search
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<BeneficiarySearch[]>([])
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<BeneficiarySearch | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)

  // Form state
  const [form, setForm] = useState({
    vaccine_type_id: '',
    dose_number: 1,
    date_given: new Date().toISOString().split('T')[0],
    district_id: '',
    block_id: '',
    village: '',
    batch_number: '',
    notes: ''
  })
  
  const [submitting, setSubmitting] = useState(false)

  // Fetch master data on mount
  useEffect(() => {
    if (isOpen) {
      fetchMasterData()
    }
  }, [isOpen])

  // Fetch blocks when district changes
  useEffect(() => {
    if (form.district_id) {
      fetchBlocks(form.district_id)
    } else {
      setBlocks([])
    }
  }, [form.district_id])

  // Debounced beneficiary search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.length >= 2) {
        handleSearch()
      } else {
        setSearchResults([])
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  const fetchMasterData = async () => {
    const [vaccines, dists] = await Promise.all([
      getVaccineTypes(),
      getDistricts()
    ])
    setVaccineTypes(vaccines)
    setDistricts(dists)
  }

  const fetchBlocks = async (districtId: string) => {
    const blocksData = await getBlocks(districtId)
    setBlocks(blocksData)
  }

  const handleSearch = async () => {
    if (searchTerm.length < 2) return
    
    setIsSearching(true)
    try {
      const results = await searchBeneficiaries(searchTerm)
      setSearchResults(results)
      setShowResults(true)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleSelectBeneficiary = (beneficiary: BeneficiarySearch) => {
    setSelectedBeneficiary(beneficiary)
    setSearchTerm(beneficiary.name)
    setShowResults(false)
    
    // Auto-fill district if available
    const matchingDistrict = districts.find(d => d.name === beneficiary.district_name)
    if (matchingDistrict) {
      setForm(prev => ({ ...prev, district_id: matchingDistrict.id }))
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!selectedBeneficiary) {
      toast.error('Please select a beneficiary')
      return
    }
    if (!form.vaccine_type_id) {
      toast.error('Please select a vaccine type')
      return
    }
    if (!form.district_id) {
      toast.error('Please select a district')
      return
    }

    setSubmitting(true)
    try {
      const result = await addVaccination({
        beneficiary_id: selectedBeneficiary.id,
        vaccine_type_id: form.vaccine_type_id,
        dose_number: Number(form.dose_number),
        date_given: form.date_given,
        district_id: form.district_id,
        block_id: form.block_id || undefined,
        village: form.village || undefined,
        batch_number: form.batch_number || undefined,
        notes: form.notes || undefined
      })

      if (result.success) {
        toast.success('Vaccination recorded successfully!')
        resetForm()
        onSuccess?.()
        onClose()
      } else {
        toast.error(result.error || 'Failed to record vaccination')
      }
    } catch (error) {
      console.error('Submit error:', error)
      toast.error('Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setForm({
      vaccine_type_id: '',
      dose_number: 1,
      date_given: new Date().toISOString().split('T')[0],
      district_id: '',
      block_id: '',
      village: '',
      batch_number: '',
      notes: ''
    })
    setSelectedBeneficiary(null)
    setSearchTerm('')
    setSearchResults([])
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  if (!isOpen) return null

  const selectedVaccine = vaccineTypes.find(v => v.id === form.vaccine_type_id)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto bg-card border border-border rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Record Vaccination</h2>
            <p className="text-sm text-muted-foreground">Add a new vaccination record</p>
          </div>
          <button 
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Beneficiary Search */}
          <div className="space-y-2">
            <Label htmlFor="beneficiary">Beneficiary *</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="beneficiary"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setSelectedBeneficiary(null)
                }}
                onFocus={() => searchResults.length > 0 && setShowResults(true)}
                className="pl-10"
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
              )}
            </div>
            
            {/* Search Results Dropdown */}
            {showResults && searchResults.length > 0 && (
              <div className="absolute z-10 w-[calc(100%-3rem)] mt-1 bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {searchResults.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => handleSelectBeneficiary(b)}
                    className="w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{b.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {b.gender} • {b.district_name} • DOB: {new Date(b.date_of_birth).toLocaleDateString()}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Selected Beneficiary Badge */}
            {selectedBeneficiary && (
              <div className="flex items-center gap-2 p-2 bg-primary/10 rounded-lg">
                <User className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">{selectedBeneficiary.name}</span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBeneficiary(null)
                    setSearchTerm('')
                  }}
                  className="ml-auto text-primary hover:text-primary/80"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Vaccine Type & Dose */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vaccine_type_id">Vaccine Type *</Label>
              <div className="relative">
                <Syringe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                <Select
                  id="vaccine_type_id"
                  name="vaccine_type_id"
                  value={form.vaccine_type_id}
                  onChange={handleChange}
                  className="pl-10"
                >
                  <option value="">Select vaccine</option>
                  {vaccineTypes.map(v => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dose_number">Dose Number *</Label>
              <Select
                id="dose_number"
                name="dose_number"
                value={form.dose_number.toString()}
                onChange={handleChange}
              >
                {Array.from({ length: selectedVaccine?.total_doses || 5 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>Dose {i + 1}</option>
                ))}
              </Select>
            </div>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date_given">Date Given *</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="date_given"
                name="date_given"
                type="date"
                value={form.date_given}
                onChange={handleChange}
                className="pl-10"
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          {/* District & Block */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="district_id">District *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                <Select
                  id="district_id"
                  name="district_id"
                  value={form.district_id}
                  onChange={handleChange}
                  className="pl-10"
                >
                  <option value="">Select district</option>
                  {districts.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="block_id">Block</Label>
              <Select
                id="block_id"
                name="block_id"
                value={form.block_id}
                onChange={handleChange}
                disabled={!form.district_id}
              >
                <option value="">Select block</option>
                {blocks.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </Select>
            </div>
          </div>

          {/* Village & Batch */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="village">Village</Label>
              <Input
                id="village"
                name="village"
                placeholder="Village name"
                value={form.village}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="batch_number">Batch Number</Label>
              <Input
                id="batch_number"
                name="batch_number"
                placeholder="e.g. BATCH-2024001"
                value={form.batch_number}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <textarea
                id="notes"
                name="notes"
                placeholder="Additional notes (optional)"
                value={form.notes}
                onChange={handleChange}
                rows={2}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-600 to-emerald-500 hover:opacity-90"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Syringe className="h-4 w-4 mr-2" />
                  Record Vaccination
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
