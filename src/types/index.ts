// =============================================
// USER & AUTH TYPES
// =============================================

export interface UserProfile {
  id: string
  name: string
  email: string
  role: 'admin' | 'health_worker'
  district_id?: string
  block_id?: string
  phone?: string
  created_at?: string
  updated_at?: string
}

// =============================================
// MASTER DATA TYPES
// =============================================

export interface VaccineType {
  id: string
  name: string
  total_doses: number
  description?: string
  min_age_months?: number
  max_age_months?: number
  created_at?: string
}

export interface District {
  id: string
  name: string
  state: string
  target_population: number
  created_at?: string
}

export interface Block {
  id: string
  name: string
  district_id: string
  target_population: number
  created_at?: string
}

// =============================================
// BENEFICIARY TYPES
// =============================================

export interface Beneficiary {
  id: string
  name: string
  date_of_birth: string
  gender: 'male' | 'female' | 'other'
  guardian_name?: string
  guardian_phone?: string
  address?: string
  district_id?: string
  block_id?: string
  village?: string
  created_by?: string
  created_at?: string
  updated_at?: string
}

// =============================================
// VACCINATION TYPES
// =============================================

export interface Vaccination {
  id: string
  beneficiary_id: string
  vaccine_type_id: string
  dose_number: number
  date_given: string
  administered_by?: string
  district_id?: string
  block_id?: string
  village?: string
  batch_number?: string
  notes?: string
  created_at?: string
}

// Extended vaccination with joined data
export interface VaccinationWithDetails extends Vaccination {
  beneficiary_name: string
  vaccine_name: string
  district_name: string
  block_name?: string
}

// =============================================
// DASHBOARD TYPES
// =============================================

export interface DashboardStats {
  totalVaccinations: number
  todayCount: number
  weekCount: number
  monthCount: number
  totalBeneficiaries: number
  totalDistricts: number
}

export interface ChartData {
  labels: string[]
  data: number[]
}

export interface VaccineTypeStats {
  vaccine_name: string
  total_count: number
  week_count: number
  today_count: number
}

export interface DistrictStats {
  district_name: string
  target_population: number
  total_vaccinations: number
  coverage_percentage: number
}

export interface AgeGroupStats {
  age_group: string
  count: number
}

export interface TrendData {
  date: string
  count: number
}

// =============================================
// FILTER TYPES
// =============================================

export interface DashboardFilters {
  dateRange: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom'
  startDate?: string
  endDate?: string
  vaccineType?: string
  district?: string
  block?: string
}

export interface FilterOptions {
  vaccineTypes: VaccineType[]
  districts: District[]
  blocks: Block[]
}

// =============================================
// FORM TYPES
// =============================================

export interface NewBeneficiaryForm {
  name: string
  date_of_birth: string
  gender: 'male' | 'female' | 'other'
  guardian_name: string
  guardian_phone: string
  address: string
  district_id: string
  block_id: string
  village: string
}

export interface NewVaccinationForm {
  beneficiary_id: string
  vaccine_type_id: string
  dose_number: number
  date_given: string
  district_id: string
  block_id: string
  village: string
  batch_number: string
  notes: string
}

// =============================================
// API RESPONSE TYPES
// =============================================

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
