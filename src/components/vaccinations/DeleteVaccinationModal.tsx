import { useState } from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { deleteVaccination, type VaccinationWithDetails } from '@/lib/api'
import { toast } from 'sonner'

interface DeleteVaccinationModalProps {
  isOpen: boolean
  vaccination: VaccinationWithDetails | null
  onClose: () => void
  onSuccess: () => void
}

export function DeleteVaccinationModal({ isOpen, vaccination, onClose, onSuccess }: DeleteVaccinationModalProps) {
  const [loading, setLoading] = useState(false)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const handleDelete = async () => {
    if (!vaccination) return

    setLoading(true)
    const result = await deleteVaccination(vaccination.id)
    setLoading(false)

    if (result.success) {
      toast.success('Vaccination record deleted successfully')
      onSuccess()
      onClose()
    } else {
      toast.error(result.error || 'Failed to delete vaccination record')
    }
  }

  if (!isOpen || !vaccination) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-card border border-border rounded-xl shadow-xl w-full max-w-md m-4">
        <div className="p-6 text-center">
          {/* Icon */}
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>

          {/* Title */}
          <h2 className="text-xl font-semibold text-foreground mb-2">Delete Vaccination Record</h2>
          
          {/* Message */}
          <p className="text-muted-foreground mb-4">
            Are you sure you want to delete this vaccination record?
          </p>

          {/* Record Summary */}
          <div className="p-3 rounded-lg bg-muted/30 text-left mb-6">
            <p className="font-medium text-foreground">{vaccination.vaccine_name} - Dose {vaccination.dose_number}</p>
            <p className="text-sm text-muted-foreground">
              {vaccination.beneficiary_name} • {formatDate(vaccination.date_given)}
            </p>
          </div>

          <p className="text-sm text-muted-foreground mb-6">
            This action cannot be undone.
          </p>

          {/* Actions */}
          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete} 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
