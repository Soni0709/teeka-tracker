import { Activity, Calendar, TrendingUp, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  variant?: 'default' | 'success' | 'warning' | 'info'
}

const variantStyles = {
  default: 'from-blue-600 to-blue-500',
  success: 'from-emerald-600 to-emerald-500',
  warning: 'from-amber-600 to-amber-500',
  info: 'from-violet-600 to-violet-500'
}

function StatCard({ title, value, subtitle, icon, variant = 'default' }: StatCardProps) {
  return (
    <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-foreground">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className={`p-3 rounded-xl bg-gradient-to-br ${variantStyles[variant]} text-white shadow-lg`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface StatsCardsProps {
  totalVaccinations: number
  weekCount: number
  todayCount: number
  monthCount?: number
}

export default function StatsCards({ totalVaccinations, weekCount, todayCount, monthCount = 0 }: StatsCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Vaccinations"
        value={totalVaccinations}
        subtitle="All time records"
        icon={<Activity className="h-6 w-6" />}
        variant="default"
      />
      <StatCard
        title="This Month"
        value={monthCount}
        subtitle="Last 30 days"
        icon={<Calendar className="h-6 w-6" />}
        variant="success"
      />
      <StatCard
        title="This Week"
        value={weekCount}
        subtitle="Last 7 days"
        icon={<TrendingUp className="h-6 w-6" />}
        variant="info"
      />
      <StatCard
        title="Today"
        value={todayCount}
        subtitle={new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}
        icon={<Clock className="h-6 w-6" />}
        variant="warning"
      />
    </div>
  )
}
