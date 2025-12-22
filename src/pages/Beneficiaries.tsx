import { useState } from 'react'
import { Plus, Search, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

export default function Beneficiaries() {
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <div>
      {/* Page Title */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Beneficiaries</h1>
          <p className="text-muted-foreground mt-1">Manage vaccination beneficiaries</p>
        </div>
        <Button 
          size="sm" 
          className="bg-gradient-to-r from-blue-600 to-emerald-500 hover:opacity-90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Beneficiary
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search beneficiaries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Placeholder Content */}
      <Card>
        <CardContent className="p-12">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Beneficiaries List</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              This page will display a list of all registered beneficiaries with search, filter, and pagination capabilities.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
