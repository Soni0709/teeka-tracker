import { useState } from 'react'
import { BarChart3, Download, FileText, Calendar, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ReportModal } from '@/components/reports'

type ReportType = 'summary' | 'coverage' | 'monthly'

const reportTypes: {
  id: ReportType
  title: string
  description: string
  icon: typeof BarChart3
}[] = [
  {
    id: 'summary',
    title: 'Vaccination Summary',
    description: 'Overview of all vaccinations by vaccine type with dose-wise breakdown',
    icon: BarChart3,
  },
  {
    id: 'coverage',
    title: 'Coverage Report',
    description: 'District-wise vaccination coverage against target population',
    icon: TrendingUp,
  },
  {
    id: 'monthly',
    title: 'Monthly Report',
    description: 'Month-wise vaccination statistics with gender breakdown',
    icon: Calendar,
  },
]

export default function Reports() {
  const [showModal, setShowModal] = useState(false)
  const [selectedReport, setSelectedReport] = useState<ReportType>('summary')

  const handleGenerateReport = (reportId: ReportType) => {
    setSelectedReport(reportId)
    setShowModal(true)
  }

  return (
    <div>
      {/* Page Title */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground mt-1">Generate and download vaccination reports</p>
        </div>
      </div>

      {/* Report Types */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {reportTypes.map((report) => (
          <Card key={report.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <report.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{report.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{report.description}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => handleGenerateReport(report.id)}
              >
                <Download className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Stats */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Report Features
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-4 rounded-lg bg-muted/30">
              <h4 className="font-medium text-foreground mb-1">Date Filtering</h4>
              <p className="text-sm text-muted-foreground">
                Filter reports by custom date range to analyze specific periods
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30">
              <h4 className="font-medium text-foreground mb-1">District Filtering</h4>
              <p className="text-sm text-muted-foreground">
                Generate reports for specific districts or view all at once
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30">
              <h4 className="font-medium text-foreground mb-1">Multiple Formats</h4>
              <p className="text-sm text-muted-foreground">
                Export reports as CSV for spreadsheets or print as PDF
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Modal */}
      <ReportModal
        isOpen={showModal}
        reportType={selectedReport}
        onClose={() => setShowModal(false)}
      />
    </div>
  )
}
