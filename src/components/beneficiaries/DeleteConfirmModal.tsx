import { useState } from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { deleteBeneficiary, type BeneficiaryWithDetails } from '@/lib/api'
import { toast } from 'sonner'

interface DeleteConfirmModalProps {
  isOpen: boolean
  beneficiary: BeneficiaryWithDetails | null
  onClose: () => void
  onSuccess: () => void
}

export function DeleteConfirmModal({ isOpen, beneficiary, onClose, onSuccess }: DeleteConfirmModalProps) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!beneficiary) return

    setLoading(true)
    const result = await deleteBeneficiary(beneficiary.id)
    setLoading(false)

    if (result.success) {
      toast.success('Beneficiary deleted successfully')
      onSuccess()
      onClose()
    } else {
      toast.error(result.error || 'Failed to delete beneficiary')
    }
  }

  if (!isOpen || !beneficiary) return null

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
          <h2 className="text-xl font-semibold text-foreground mb-2">Delete Beneficiary</h2>
          
          {/* Message */}
          <p className="text-muted-foreground mb-6">
            Are you sure you want to delete <span className="font-medium text-foreground">{beneficiary.name}</span>? 
            This action cannot be undone.
          </p>

          {/* Warning for vaccinations */}
          {beneficiary.vaccination_count > 0 && (
            <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 mb-6">
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                This beneficiary has {beneficiary.vaccination_count} vaccination record(s). 
                You cannot delete beneficiaries with existing vaccination records.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete} 
              disabled={loading || beneficiary.vaccination_count > 0}
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
