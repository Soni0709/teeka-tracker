import { X, User, Syringe, Calendar, MapPin, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { VaccinationWithDetails } from '@/lib/api'

interface ViewVaccinationModalProps {
  isOpen: boolean
  vaccination: VaccinationWithDetails | null
  onClose: () => void
}

export function ViewVaccinationModal({ isOpen, vaccination, onClose }: ViewVaccinationModalProps) {
  
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

  if (!isOpen || !vaccination) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-card border border-border rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Vaccination Details</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Vaccine Info */}
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Syringe className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground">{vaccination.vaccine_name}</h3>
              <p className="text-muted-foreground">Dose {vaccination.dose_number}</p>
            </div>
          </div>

          {/* Date */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
            <Calendar className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium text-foreground">Administered on</p>
              <p className="text-sm text-muted-foreground">{formatDate(vaccination.date_given)}</p>
            </div>
          </div>

          {/* Beneficiary Info */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
            <User className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium text-foreground">{vaccination.beneficiary_name}</p>
              <p className="text-sm text-muted-foreground">
                {calculateAge(vaccination.beneficiary_dob)} • 
                <span className="capitalize"> {vaccination.beneficiary_gender}</span>
              </p>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
            <MapPin className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium text-foreground">
                {vaccination.district_name}
                {vaccination.block_name && `, ${vaccination.block_name}`}
              </p>
              {vaccination.village && (
                <p className="text-sm text-muted-foreground">{vaccination.village}</p>
              )}
            </div>
          </div>

          {/* Batch & Notes */}
          {(vaccination.batch_number || vaccination.notes) && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
              <FileText className="h-5 w-5 text-primary mt-0.5" />
              <div>
                {vaccination.batch_number && (
                  <>
                    <p className="font-medium text-foreground">Batch Number</p>
                    <p className="text-sm text-muted-foreground mb-2">{vaccination.batch_number}</p>
                  </>
                )}
                {vaccination.notes && (
                  <>
                    <p className="font-medium text-foreground">Notes</p>
                    <p className="text-sm text-muted-foreground">{vaccination.notes}</p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Record Info */}
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Record created on {formatDate(vaccination.created_at)}
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
