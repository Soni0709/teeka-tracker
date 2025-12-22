import { MapPin } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { DistrictStats } from '@/types'

interface DistrictCoverageProps {
  data: DistrictStats[]
  loading?: boolean
}

export default function DistrictCoverage({ data, loading }: DistrictCoverageProps) {
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

  // Sort by total vaccinations (highest first)
  const sortedData = [...data].sort((a, b) => b.total_vaccinations - a.total_vaccinations)
  const topDistricts = sortedData.slice(0, 5)
  const maxVaccinations = Math.max(...topDistricts.map(d => d.total_vaccinations))

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-foreground">District Coverage</h3>
            <p className="text-sm text-muted-foreground">Top 5 districts by vaccinations</p>
          </div>
          <div className="p-2 rounded-lg bg-primary/10">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
        </div>

        <div className="space-y-4">
          {topDistricts.map((district, index) => {
            const percentage = (district.total_vaccinations / maxVaccinations) * 100
            const colors = [
              'bg-blue-500',
              'bg-emerald-500',
              'bg-amber-500',
              'bg-violet-500',
              'bg-pink-500'
            ]

            return (
              <div key={district.district_name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </span>
                    <span className="font-medium text-foreground">{district.district_name}</span>
                  </div>
                  <span className="text-muted-foreground">
                    {district.total_vaccinations.toLocaleString()}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${colors[index]} rounded-full transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Districts</span>
            <span className="font-semibold text-foreground">{data.length}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
