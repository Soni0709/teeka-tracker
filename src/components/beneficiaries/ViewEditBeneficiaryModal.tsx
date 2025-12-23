/* eslint-disable react-hooks/immutability */
import { useState, useEffect } from 'react'
import { X, Loader2, User, Calendar, MapPin, Phone, Syringe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  updateBeneficiary, 
  getDistricts, 
  getBlocks, 
  type District, 
  type Block, 
  type BeneficiaryWithDetails,
  type NewBeneficiary
} from '@/lib/api'
import { toast } from 'sonner'

interface ViewEditBeneficiaryModalProps {
  isOpen: boolean
  mode: 'view' | 'edit'
  beneficiary: BeneficiaryWithDetails | null
  onClose: () => void
  onSuccess: () => void
}

export function ViewEditBeneficiaryModal({ 
  isOpen, 
  mode, 
  beneficiary, 
  onClose, 
  onSuccess 
}: ViewEditBeneficiaryModalProps) {
  const [currentMode, setCurrentMode] = useState<'view' | 'edit'>(mode)
  const [form, setForm] = useState<Partial<NewBeneficiary>>({})
  const [loading, setLoading] = useState(false)
  const [districts, setDistricts] = useState<District[]>([])
  const [blocks, setBlocks] = useState<Block[]>([])

  useEffect(() => {
    if (isOpen && beneficiary) {
      setCurrentMode(mode)
      setForm({
        name: beneficiary.name,
        date_of_birth: beneficiary.date_of_birth,
        gender: beneficiary.gender,
        guardian_name: beneficiary.guardian_name,
        guardian_phone: beneficiary.guardian_phone,
        address: beneficiary.address,
        district_id: beneficiary.district_id,
        block_id: beneficiary.block_id,
        village: beneficiary.village
      })
      loadDistricts()
      if (beneficiary.district_id) {
        loadBlocks(beneficiary.district_id)
      }
    }
  }, [isOpen, beneficiary, mode])

  const loadDistricts = async () => {
    const data = await getDistricts()
    setDistricts(data)
  }

  const loadBlocks = async (districtId: string) => {
    const data = await getBlocks(districtId)
    setBlocks(data)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'district_id' ? { block_id: '' } : {})
    }))
    if (name === 'district_id') {
      loadBlocks(value)
    }
  }

  const handleSave = async () => {
    if (!beneficiary) return

    setLoading(true)
    const result = await updateBeneficiary(beneficiary.id, form)
    setLoading(false)

    if (result.success) {
      toast.success('Beneficiary updated successfully')
      onSuccess()
      onClose()
    } else {
      toast.error(result.error || 'Failed to update beneficiary')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob)
    const today = new Date()
    const months = (today.getFullYear() - birthDate.getFullYear()) * 12 + 
                   (today.getMonth() - birthDate.getMonth())
    
    if (months < 12) {
      return `${months} months old`
    } else if (months < 24) {
      return `${Math.floor(months / 12)} year ${months % 12} months old`
    } else {
      return `${Math.floor(months / 12)} years old`
    }
  }

  if (!isOpen || !beneficiary) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-card border border-border rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            {currentMode === 'view' ? 'Beneficiary Details' : 'Edit Beneficiary'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {currentMode === 'view' ? (
            // View Mode
            <div className="space-y-6">
              {/* Name & Basic Info */}
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <User className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">{beneficiary.name}</h3>
                  <p className="text-muted-foreground capitalize">{beneficiary.gender}</p>
                </div>
              </div>

              {/* Age & DOB */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">{calculateAge(beneficiary.date_of_birth)}</p>
                  <p className="text-sm text-muted-foreground">Born on {formatDate(beneficiary.date_of_birth)}</p>
                </div>
              </div>

              {/* Guardian Info */}
              {(beneficiary.guardian_name || beneficiary.guardian_phone) && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <Phone className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">{beneficiary.guardian_name || 'No guardian name'}</p>
                    <p className="text-sm text-muted-foreground">{beneficiary.guardian_phone || 'No phone'}</p>
                  </div>
                </div>
              )}

              {/* Location */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">
                    {beneficiary.district_name}
                    {beneficiary.block_name && `, ${beneficiary.block_name}`}
                  </p>
                  {beneficiary.village && (
                    <p className="text-sm text-muted-foreground">{beneficiary.village}</p>
                  )}
                  {beneficiary.address && (
                    <p className="text-sm text-muted-foreground mt-1">{beneficiary.address}</p>
                  )}
                </div>
              </div>

              {/* Vaccination Count */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10">
                <Syringe className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">{beneficiary.vaccination_count} Vaccinations</p>
                  <p className="text-sm text-muted-foreground">Total doses administered</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
                <Button onClick={() => setCurrentMode('edit')}>
                  Edit Details
                </Button>
              </div>
            </div>
          ) : (
            // Edit Mode
            <div className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={form.name || ''}
                  onChange={handleChange}
                  placeholder="Enter beneficiary name"
                  required
                />
              </div>

              {/* Date of Birth & Gender */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">Date of Birth *</Label>
                  <Input
                    id="date_of_birth"
                    name="date_of_birth"
                    type="date"
                    value={form.date_of_birth || ''}
                    onChange={handleChange}
                    max={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <select
                    id="gender"
                    name="gender"
                    value={form.gender || 'male'}
                    onChange={handleChange}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Guardian Name & Phone */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="guardian_name">Guardian Name</Label>
                  <Input
                    id="guardian_name"
                    name="guardian_name"
                    value={form.guardian_name || ''}
                    onChange={handleChange}
                    placeholder="Parent/Guardian name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guardian_phone">Guardian Phone</Label>
                  <Input
                    id="guardian_phone"
                    name="guardian_phone"
                    value={form.guardian_phone || ''}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              {/* District & Block */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="district_id">District *</Label>
                  <select
                    id="district_id"
                    name="district_id"
                    value={form.district_id || ''}
                    onChange={handleChange}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                  >
                    <option value="">Select District</option>
                    {districts.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="block_id">Block</Label>
                  <select
                    id="block_id"
                    name="block_id"
                    value={form.block_id || ''}
                    onChange={handleChange}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    disabled={!form.district_id}
                  >
                    <option value="">Select Block</option>
                    {blocks.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Village */}
              <div className="space-y-2">
                <Label htmlFor="village">Village</Label>
                <Input
                  id="village"
                  name="village"
                  value={form.village || ''}
                  onChange={handleChange}
                  placeholder="Village name"
                />
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <textarea
                  id="address"
                  name="address"
                  value={form.address || ''}
                  onChange={handleChange}
                  placeholder="Full address"
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button variant="outline" onClick={() => setCurrentMode('view')}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
