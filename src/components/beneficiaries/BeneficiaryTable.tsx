import { Eye, Edit2, Trash2, ChevronLeft, ChevronRight, Syringe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { BeneficiaryWithDetails } from '@/lib/api'

interface BeneficiaryTableProps {
  data: BeneficiaryWithDetails[]
  loading: boolean
  page: number
  totalPages: number
  total: number
  onPageChange: (page: number) => void
  onView: (beneficiary: BeneficiaryWithDetails) => void
  onEdit: (beneficiary: BeneficiaryWithDetails) => void
  onDelete: (beneficiary: BeneficiaryWithDetails) => void
}

export function BeneficiaryTable({
  data,
  loading,
  page,
  totalPages,
  total,
  onPageChange,
  onView,
  onEdit,
  onDelete
}: BeneficiaryTableProps) {
  
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
      return `${months} months`
    } else if (months < 24) {
      return `${Math.floor(months / 12)} year ${months % 12} months`
    } else {
      return `${Math.floor(months / 12)} years`
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
        <p className="text-muted-foreground">No beneficiaries found</p>
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
              <th className="text-left p-4 font-medium text-muted-foreground text-sm">Name</th>
              <th className="text-left p-4 font-medium text-muted-foreground text-sm">Age / DOB</th>
              <th className="text-left p-4 font-medium text-muted-foreground text-sm">Gender</th>
              <th className="text-left p-4 font-medium text-muted-foreground text-sm">Guardian</th>
              <th className="text-left p-4 font-medium text-muted-foreground text-sm">Location</th>
              <th className="text-center p-4 font-medium text-muted-foreground text-sm">Vaccinations</th>
              <th className="text-right p-4 font-medium text-muted-foreground text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((beneficiary) => (
              <tr 
                key={beneficiary.id} 
                className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
              >
                <td className="p-4">
                  <p className="font-medium text-foreground">{beneficiary.name}</p>
                </td>
                <td className="p-4">
                  <p className="text-foreground">{calculateAge(beneficiary.date_of_birth)}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(beneficiary.date_of_birth)}</p>
                </td>
                <td className="p-4">
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium capitalize
                    ${beneficiary.gender === 'male' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : ''}
                    ${beneficiary.gender === 'female' ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400' : ''}
                    ${beneficiary.gender === 'other' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : ''}
                  `}>
                    {beneficiary.gender}
                  </span>
                </td>
                <td className="p-4">
                  <p className="text-foreground">{beneficiary.guardian_name || '-'}</p>
                  {beneficiary.guardian_phone && (
                    <p className="text-xs text-muted-foreground">{beneficiary.guardian_phone}</p>
                  )}
                </td>
                <td className="p-4">
                  <p className="text-foreground">{beneficiary.district_name}</p>
                  {beneficiary.block_name && (
                    <p className="text-xs text-muted-foreground">{beneficiary.block_name}</p>
                  )}
                </td>
                <td className="p-4 text-center">
                  <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary">
                    <Syringe className="h-3 w-3" />
                    <span className="text-sm font-medium">{beneficiary.vaccination_count}</span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onView(beneficiary)}
                      title="View details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onEdit(beneficiary)}
                      title="Edit"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => onDelete(beneficiary)}
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
          Showing {((page - 1) * 10) + 1} - {Math.min(page * 10, total)} of {total} beneficiaries
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
