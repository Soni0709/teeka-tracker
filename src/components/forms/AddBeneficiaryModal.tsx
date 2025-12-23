/* eslint-disable react-hooks/immutability */
import { useState, useEffect } from 'react'
import { X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { addBeneficiary, getDistricts, getBlocks, type District, type Block, type NewBeneficiary } from '@/lib/api'
import { toast } from 'sonner'

interface AddBeneficiaryModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const initialFormState: NewBeneficiary = {
  name: '',
  date_of_birth: '',
  gender: 'male',
  guardian_name: '',
  guardian_phone: '',
  address: '',
  district_id: '',
  block_id: '',
  village: ''
}

export function AddBeneficiaryModal({ isOpen, onClose, onSuccess }: AddBeneficiaryModalProps) {
  const [form, setForm] = useState<NewBeneficiary>(initialFormState)
  const [loading, setLoading] = useState(false)
  const [districts, setDistricts] = useState<District[]>([])
  const [blocks, setBlocks] = useState<Block[]>([])
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (isOpen) {
      loadDistricts()
      setForm(initialFormState)
    }
  }, [isOpen])

  useEffect(() => {
    if (form.district_id) {
      loadBlocks(form.district_id)
    } else {
      setBlocks([])
    }
  }, [form.district_id])

  const loadDistricts = async () => {
    setLoadingData(true)
    const data = await getDistricts()
    setDistricts(data)
    setLoadingData(false)
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
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!form.name || !form.date_of_birth || !form.district_id) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    const result = await addBeneficiary(form)
    setLoading(false)

    if (result.success) {
      toast.success('Beneficiary added successfully')
      onSuccess()
      onClose()
    } else {
      toast.error(result.error || 'Failed to add beneficiary')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-card border border-border rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Add New Beneficiary</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {loadingData ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={form.name}
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
                    value={form.date_of_birth}
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
                    value={form.gender}
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
                    value={form.guardian_name}
                    onChange={handleChange}
                    placeholder="Parent/Guardian name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guardian_phone">Guardian Phone</Label>
                  <Input
                    id="guardian_phone"
                    name="guardian_phone"
                    value={form.guardian_phone}
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
                    value={form.district_id}
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
                    value={form.block_id}
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
                  value={form.village}
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
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Full address"
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Adding...
                    </>
                  ) : (
                    'Add Beneficiary'
                  )}
                </Button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  )
}
