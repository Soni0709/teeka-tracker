import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Card, CardContent } from '@/components/ui/card'
import type { AgeGroupStats } from '@/types'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface AgeGroupChartProps {
  data: AgeGroupStats[]
  loading?: boolean
}

export default function AgeGroupChart({ data, loading }: AgeGroupChartProps) {
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
    labels: data.map(d => d.age_group),
    datasets: [
      {
        label: 'Vaccinations',
        data: data.map(d => d.count),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
          'rgb(139, 92, 246)',
        ],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        cornerRadius: 8,
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: { size: 11 }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: { size: 11 }
        }
      }
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-foreground">By Age Group</h3>
            <p className="text-sm text-muted-foreground">Vaccination distribution by age</p>
          </div>
        </div>
        <div className="h-64">
          <Bar data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  )
}
