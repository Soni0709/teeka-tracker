// User Profile type
export interface UserProfile {
  id: string
  name: string
  email: string
  role: 'admin' | 'health_worker'
  district?: string
  created_at?: string
}

// Vaccination record type
export interface Vaccination {
  id: string
  beneficiary_name: string
  age: number
  gender: 'male' | 'female' | 'other'
  vaccine_type: string
  dose_number: number
  date_given: string
  district: string
  block: string
  village?: string
  administered_by: string
  created_at: string
}

// Vaccine type
export interface VaccineType {
  id: string
  name: string
  total_doses: number
  description?: string
}

// Dashboard stats type
export interface DashboardStats {
  totalVaccinations: number
  vaccineTypeData: {
    labels: string[]
    data: number[]
  }
  ageGroupData: {
    labels: string[]
    data: number[]
  }
  timeSeriesData: {
    labels: string[]
    data: number[]
  }
  lowCoverageRegions: {
    name: string
    count: number
  }[]
}

// Filter options type
export interface FilterOptions {
  vaccineTypes: string[]
  regions: string[]
}

// Dashboard filters type
export interface DashboardFilters {
  dateRange: string
  vaccineType: string
  region: string
  ageGroup: string
}
