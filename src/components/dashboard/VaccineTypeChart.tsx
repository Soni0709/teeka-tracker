import { Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'
import { Card, CardContent } from '@/components/ui/card'
import type { VaccineTypeStats } from '@/types'

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend)

interface VaccineTypeChartProps {
  data: VaccineTypeStats[]
  loading?: boolean
}

const COLORS = [
  'rgba(59, 130, 246, 0.8)',   // Blue
  'rgba(16, 185, 129, 0.8)',   // Green
  'rgba(245, 158, 11, 0.8)',   // Amber
  'rgba(139, 92, 246, 0.8)',   // Purple
  'rgba(236, 72, 153, 0.8)',   // Pink
  'rgba(20, 184, 166, 0.8)',   // Teal
  'rgba(249, 115, 22, 0.8)',   // Orange
  'rgba(99, 102, 241, 0.8)',   // Indigo
  'rgba(234, 179, 8, 0.8)',    // Yellow
  'rgba(168, 85, 247, 0.8)',   // Violet
]

export default function VaccineTypeChart({ data, loading }: VaccineTypeChartProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="h-64 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const chartData = {
    labels: data.map(d => d.vaccine_name),
    datasets: [
      {
        data: data.map(d => d.total_count),
        backgroundColor: COLORS.slice(0, data.length),
        borderColor: COLORS.slice(0, data.length).map(c => c.replace('0.8', '1')),
        borderWidth: 2,
        hoverOffset: 4
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle',
          font: { size: 11 }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: function(context: any) {
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
            const percentage = ((context.raw / total) * 100).toFixed(1)
            return `${context.label}: ${context.raw} (${percentage}%)`
          }
        }
      }
    },
    cutout: '60%'
  }

  const total = data.reduce((sum, d) => sum + d.total_count, 0)

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-foreground">By Vaccine Type</h3>
            <p className="text-sm text-muted-foreground">Distribution of {total.toLocaleString()} vaccinations</p>
          </div>
        </div>
        <div className="h-64 relative">
          <Doughnut data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  )
}
