import { Eye, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { VaccinationWithDetails } from '@/lib/api'

interface VaccinationTableProps {
  data: VaccinationWithDetails[]
  loading: boolean
  page: number
  totalPages: number
  total: number
  onPageChange: (page: number) => void
  onView: (vaccination: VaccinationWithDetails) => void
  onDelete: (vaccination: VaccinationWithDetails) => void
}

export function VaccinationTable({
  data,
  loading,
  page,
  totalPages,
  total,
  onPageChange,
  onView,
  onDelete
}: VaccinationTableProps) {
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob)
    const today = new Date()
    const months = (today.getFullYear() - birthDate.getFullYear()) * 12 + 
                   (today.getMonth() - birthDate.getMonth())
    
    if (months < 12) {
      return `${months}m`
    } else {
      return `${Math.floor(months / 12)}y`
    }
  }

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="animate-pulse">
          <div className="h-12 bg-muted/50 border-b border-border" />
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-16 border-b border-border last:border-0">
              <div className="p-4 flex gap-4">
                <div className="h-4 w-32 bg-muted rounded" />
                <div className="h-4 w-24 bg-muted rounded" />
                <div className="h-4 w-20 bg-muted rounded" />
                <div className="h-4 w-28 bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-12 text-center">
        <p className="text-muted-foreground">No vaccination records found</p>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left p-4 font-medium text-muted-foreground text-sm">Date</th>
              <th className="text-left p-4 font-medium text-muted-foreground text-sm">Beneficiary</th>
              <th className="text-left p-4 font-medium text-muted-foreground text-sm">Vaccine</th>
              <th className="text-center p-4 font-medium text-muted-foreground text-sm">Dose</th>
              <th className="text-left p-4 font-medium text-muted-foreground text-sm">Location</th>
              <th className="text-left p-4 font-medium text-muted-foreground text-sm">Batch</th>
              <th className="text-right p-4 font-medium text-muted-foreground text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((vaccination) => (
              <tr 
                key={vaccination.id} 
                className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
              >
                <td className="p-4">
                  <p className="font-medium text-foreground">{formatDate(vaccination.date_given)}</p>
                </td>
                <td className="p-4">
                  <p className="font-medium text-foreground">{vaccination.beneficiary_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {calculateAge(vaccination.beneficiary_dob)} • 
                    <span className="capitalize"> {vaccination.beneficiary_gender}</span>
                  </p>
                </td>
                <td className="p-4">
                  <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    {vaccination.vaccine_name}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-secondary/10 text-secondary text-sm font-medium">
                    {vaccination.dose_number}
                  </span>
                </td>
                <td className="p-4">
                  <p className="text-foreground">{vaccination.district_name}</p>
                  {vaccination.block_name && (
                    <p className="text-xs text-muted-foreground">{vaccination.block_name}</p>
                  )}
                </td>
                <td className="p-4">
                  <p className="text-foreground text-sm">{vaccination.batch_number || '-'}</p>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onView(vaccination)}
                      title="View details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => onDelete(vaccination)}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between p-4 border-t border-border">
        <p className="text-sm text-muted-foreground">
          Showing {((page - 1) * 10) + 1} - {Math.min(page * 10, total)} of {total} records
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-foreground px-2">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
