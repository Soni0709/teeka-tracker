/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/immutability */
import { useState, useEffect } from 'react'
import { X, Loader2, FileSpreadsheet, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  getDistricts,
  getVaccinationSummaryReport,
  getDistrictCoverageReport,
  getMonthlyReport,
  type District,
  type ReportFilters,
  type VaccineSummaryRow,
  type DistrictCoverageRow,
  type MonthlyReportRow
} from '@/lib/api'
import { toast } from 'sonner'

type ReportType = 'summary' | 'coverage' | 'monthly'

interface ReportModalProps {
  isOpen: boolean
  reportType: ReportType
  onClose: () => void
}

const reportTitles: Record<ReportType, string> = {
  summary: 'Vaccination Summary Report',
  coverage: 'District Coverage Report',
  monthly: 'Monthly Report'
}

export function ReportModal({ isOpen, reportType, onClose }: ReportModalProps) {
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [districts, setDistricts] = useState<District[]>([])
  
  // Filters
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [districtId, setDistrictId] = useState('')

  // Report data
  const [summaryData, setSummaryData] = useState<VaccineSummaryRow[]>([])
  const [coverageData, setCoverageData] = useState<DistrictCoverageRow[]>([])
  const [monthlyData, setMonthlyData] = useState<MonthlyReportRow[]>([])
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadDistricts()
      resetForm()
    }
  }, [isOpen])

  const loadDistricts = async () => {
    setLoading(true)
    const data = await getDistricts()
    setDistricts(data)
    setLoading(false)
  }

  const resetForm = () => {
    setStartDate('')
    setEndDate('')
    setDistrictId('')
    setSummaryData([])
    setCoverageData([])
    setMonthlyData([])
    setShowPreview(false)
  }

  const handleGenerate = async () => {
    setGenerating(true)
    
    const filters: ReportFilters = {}
    if (startDate) filters.start_date = startDate
    if (endDate) filters.end_date = endDate
    if (districtId) filters.district_id = districtId

    try {
      switch (reportType) {
        case 'summary':
          { const summary = await getVaccinationSummaryReport(filters)
          setSummaryData(summary)
          break }
        case 'coverage':
          { const coverage = await getDistrictCoverageReport(filters)
          setCoverageData(coverage)
          break }
        case 'monthly':
          { const monthly = await getMonthlyReport(filters)
          setMonthlyData(monthly)
          break }
      }
      setShowPreview(true)
    } catch (error) {
      toast.error('Failed to generate report')
    }
    
    setGenerating(false)
  }

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1)
    return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
  }

  const getReportData = () => {
    switch (reportType) {
      case 'summary':
        return summaryData
      case 'coverage':
        return coverageData
      case 'monthly':
        return monthlyData
      default:
        return []
    }
  }

  const exportCSV = () => {
    const data = getReportData()
    if (data.length === 0) return

    let headers: string[] = []
    let rows: string[][] = []

    switch (reportType) {
      case 'summary':
        headers = ['Vaccine', 'Total Doses', 'Dose 1', 'Dose 2', 'Dose 3', 'Dose 4']
        rows = (data as VaccineSummaryRow[]).map(r => [
          r.vaccine_name,
          r.total_doses.toString(),
          r.dose_1.toString(),
          r.dose_2.toString(),
          r.dose_3.toString(),
          r.dose_4.toString()
        ])
        break
      case 'coverage':
        headers = ['District', 'Target Population', 'Total Vaccinations', 'Unique Beneficiaries', 'Coverage %']
        rows = (data as DistrictCoverageRow[]).map(r => [
          r.district_name,
          r.target_population.toString(),
          r.total_vaccinations.toString(),
          r.unique_beneficiaries.toString(),
          r.coverage_percentage.toFixed(2) + '%'
        ])
        break
      case 'monthly':
        headers = ['Month', 'Total Vaccinations', 'Unique Beneficiaries', 'Male', 'Female']
        rows = (data as MonthlyReportRow[]).map(r => [
          formatMonth(r.month),
          r.total_vaccinations.toString(),
          r.unique_beneficiaries.toString(),
          r.male_count.toString(),
          r.female_count.toString()
        ])
        break
    }

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    
    toast.success('Report downloaded as CSV')
  }

  const printReport = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      toast.error('Please allow popups to print the report')
      return
    }

    const data = getReportData()
    let tableHtml = ''

    switch (reportType) {
      case 'summary':
        tableHtml = `
          <table>
            <thead>
              <tr>
                <th>Vaccine</th>
                <th>Total Doses</th>
                <th>Dose 1</th>
                <th>Dose 2</th>
                <th>Dose 3</th>
                <th>Dose 4</th>
              </tr>
            </thead>
            <tbody>
              ${(data as VaccineSummaryRow[]).map(r => `
                <tr>
                  <td>${r.vaccine_name}</td>
                  <td>${r.total_doses}</td>
                  <td>${r.dose_1}</td>
                  <td>${r.dose_2}</td>
                  <td>${r.dose_3}</td>
                  <td>${r.dose_4}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `
        break
      case 'coverage':
        tableHtml = `
          <table>
            <thead>
              <tr>
                <th>District</th>
                <th>Target Population</th>
                <th>Total Vaccinations</th>
                <th>Unique Beneficiaries</th>
                <th>Coverage %</th>
              </tr>
            </thead>
            <tbody>
              ${(data as DistrictCoverageRow[]).map(r => `
                <tr>
                  <td>${r.district_name}</td>
                  <td>${r.target_population.toLocaleString()}</td>
                  <td>${r.total_vaccinations.toLocaleString()}</td>
                  <td>${r.unique_beneficiaries.toLocaleString()}</td>
                  <td>${r.coverage_percentage.toFixed(2)}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `
        break
      case 'monthly':
        tableHtml = `
          <table>
            <thead>
              <tr>
                <th>Month</th>
                <th>Total Vaccinations</th>
                <th>Unique Beneficiaries</th>
                <th>Male</th>
                <th>Female</th>
              </tr>
            </thead>
            <tbody>
              ${(data as MonthlyReportRow[]).map(r => `
                <tr>
                  <td>${formatMonth(r.month)}</td>
                  <td>${r.total_vaccinations.toLocaleString()}</td>
                  <td>${r.unique_beneficiaries.toLocaleString()}</td>
                  <td>${r.male_count.toLocaleString()}</td>
                  <td>${r.female_count.toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `
        break
    }

    const filterInfo = [
      startDate && `From: ${startDate}`,
      endDate && `To: ${endDate}`,
      districtId && `District: ${districts.find(d => d.id === districtId)?.name || ''}`
    ].filter(Boolean).join(' | ')

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${reportTitles[reportType]}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #1a1a1a; margin-bottom: 5px; }
          .subtitle { color: #666; margin-bottom: 20px; }
          .filters { color: #888; font-size: 12px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background-color: #f5f5f5; font-weight: 600; }
          tr:nth-child(even) { background-color: #fafafa; }
          .footer { margin-top: 30px; font-size: 11px; color: #888; }
        </style>
      </head>
      <body>
        <h1>${reportTitles[reportType]}</h1>
        <p class="subtitle">TeekaSetu - Vaccination Management System</p>
        ${filterInfo ? `<p class="filters">${filterInfo}</p>` : ''}
        ${tableHtml}
        <p class="footer">Generated on ${new Date().toLocaleString('en-IN')}</p>
      </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-card border border-border rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden m-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
          <h2 className="text-lg font-semibold text-foreground">{reportTitles[reportType]}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !showPreview ? (
            // Filter Form
            <div className="space-y-6">
              <p className="text-muted-foreground">
                Configure filters to generate your report. Leave empty for all data.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Start Date */}
                <div className="space-y-2">
                  <Label htmlFor="start_date">From Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                {/* End Date */}
                <div className="space-y-2">
                  <Label htmlFor="end_date">To Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>

                {/* District */}
                <div className="space-y-2">
                  <Label htmlFor="district">District</Label>
                  <select
                    id="district"
                    value={districtId}
                    onChange={(e) => setDistrictId(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">All Districts</option>
                    {districts.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={handleGenerate} disabled={generating}>
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    'Generate Report'
                  )}
                </Button>
              </div>
            </div>
          ) : (
            // Report Preview
            <div className="space-y-4">
              {/* Summary Stats */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {getReportData().length} records found
                </p>
                <Button variant="ghost" size="sm" onClick={() => setShowPreview(false)}>
                  ← Back to filters
                </Button>
              </div>

              {/* Data Table */}
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  {reportType === 'summary' && summaryData.length > 0 && (
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted/30 border-b border-border">
                          <th className="text-left p-3 font-medium text-muted-foreground text-sm">Vaccine</th>
                          <th className="text-right p-3 font-medium text-muted-foreground text-sm">Total</th>
                          <th className="text-right p-3 font-medium text-muted-foreground text-sm">Dose 1</th>
                          <th className="text-right p-3 font-medium text-muted-foreground text-sm">Dose 2</th>
                          <th className="text-right p-3 font-medium text-muted-foreground text-sm">Dose 3</th>
                          <th className="text-right p-3 font-medium text-muted-foreground text-sm">Dose 4</th>
                        </tr>
                      </thead>
                      <tbody>
                        {summaryData.map((row, i) => (
                          <tr key={i} className="border-b border-border last:border-0">
                            <td className="p-3 font-medium text-foreground">{row.vaccine_name}</td>
                            <td className="p-3 text-right text-foreground">{row.total_doses.toLocaleString()}</td>
                            <td className="p-3 text-right text-muted-foreground">{row.dose_1.toLocaleString()}</td>
                            <td className="p-3 text-right text-muted-foreground">{row.dose_2.toLocaleString()}</td>
                            <td className="p-3 text-right text-muted-foreground">{row.dose_3.toLocaleString()}</td>
                            <td className="p-3 text-right text-muted-foreground">{row.dose_4.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {reportType === 'coverage' && coverageData.length > 0 && (
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted/30 border-b border-border">
                          <th className="text-left p-3 font-medium text-muted-foreground text-sm">District</th>
                          <th className="text-right p-3 font-medium text-muted-foreground text-sm">Target</th>
                          <th className="text-right p-3 font-medium text-muted-foreground text-sm">Vaccinations</th>
                          <th className="text-right p-3 font-medium text-muted-foreground text-sm">Beneficiaries</th>
                          <th className="text-right p-3 font-medium text-muted-foreground text-sm">Coverage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {coverageData.map((row, i) => (
                          <tr key={i} className="border-b border-border last:border-0">
                            <td className="p-3 font-medium text-foreground">{row.district_name}</td>
                            <td className="p-3 text-right text-muted-foreground">{row.target_population.toLocaleString()}</td>
                            <td className="p-3 text-right text-foreground">{row.total_vaccinations.toLocaleString()}</td>
                            <td className="p-3 text-right text-muted-foreground">{row.unique_beneficiaries.toLocaleString()}</td>
                            <td className="p-3 text-right">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium
                                ${row.coverage_percentage >= 80 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : ''}
                                ${row.coverage_percentage >= 50 && row.coverage_percentage < 80 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : ''}
                                ${row.coverage_percentage < 50 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : ''}
                              `}>
                                {row.coverage_percentage.toFixed(2)}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {reportType === 'monthly' && monthlyData.length > 0 && (
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted/30 border-b border-border">
                          <th className="text-left p-3 font-medium text-muted-foreground text-sm">Month</th>
                          <th className="text-right p-3 font-medium text-muted-foreground text-sm">Vaccinations</th>
                          <th className="text-right p-3 font-medium text-muted-foreground text-sm">Beneficiaries</th>
                          <th className="text-right p-3 font-medium text-muted-foreground text-sm">Male</th>
                          <th className="text-right p-3 font-medium text-muted-foreground text-sm">Female</th>
                        </tr>
                      </thead>
                      <tbody>
                        {monthlyData.map((row, i) => (
                          <tr key={i} className="border-b border-border last:border-0">
                            <td className="p-3 font-medium text-foreground">{formatMonth(row.month)}</td>
                            <td className="p-3 text-right text-foreground">{row.total_vaccinations.toLocaleString()}</td>
                            <td className="p-3 text-right text-muted-foreground">{row.unique_beneficiaries.toLocaleString()}</td>
                            <td className="p-3 text-right text-muted-foreground">{row.male_count.toLocaleString()}</td>
                            <td className="p-3 text-right text-muted-foreground">{row.female_count.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {getReportData().length === 0 && (
                    <div className="p-12 text-center">
                      <p className="text-muted-foreground">No data found for the selected filters</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer with Export Options */}
        {showPreview && getReportData().length > 0 && (
          <div className="flex items-center justify-end gap-3 p-4 border-t border-border flex-shrink-0">
            <Button variant="outline" onClick={exportCSV}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Download CSV
            </Button>
            <Button onClick={printReport}>
              <FileText className="h-4 w-4 mr-2" />
              Print / PDF
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
