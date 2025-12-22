import { BarChart3, Download, FileText, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const reportTypes = [
  {
    title: 'Vaccination Summary',
    description: 'Overview of all vaccinations by type, district, and time period',
    icon: BarChart3,
  },
  {
    title: 'Coverage Report',
    description: 'District-wise vaccination coverage against targets',
    icon: FileText,
  },
  {
    title: 'Monthly Report',
    description: 'Detailed monthly vaccination statistics',
    icon: Calendar,
  },
]

export default function Reports() {
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
          <Card key={report.title} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <report.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{report.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{report.description}</p>
              <Button variant="outline" size="sm" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Placeholder Content */}
      <Card>
        <CardContent className="p-12">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Report Generation</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Select a report type above to generate and download detailed vaccination reports in PDF or Excel format.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
