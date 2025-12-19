// =============================================
// MOCK DATA - Fallback when Supabase is unavailable
// =============================================

import type { VaccineType, TrendData, AgeGroupStats } from '@/types'

// Mock vaccine types
export const mockVaccineTypes: VaccineType[] = [
  { id: '1', name: 'BCG', total_doses: 1, description: 'Bacillus Calmette-Guérin' },
  { id: '2', name: 'OPV', total_doses: 5, description: 'Oral Polio Vaccine' },
  { id: '3', name: 'Hepatitis B', total_doses: 4, description: 'Hepatitis B vaccine' },
  { id: '4', name: 'DPT', total_doses: 5, description: 'Diphtheria, Pertussis, Tetanus' },
  { id: '5', name: 'Measles', total_doses: 2, description: 'Measles vaccine' },
  { id: '6', name: 'Rotavirus', total_doses: 3, description: 'Rotavirus vaccine' },
]

// Mock dashboard stats
export const mockDashboardStats = {
  total_vaccinations: 1650,
  today_count: 25,
  week_count: 143,
  month_count: 520,
  total_beneficiaries: 500,
  total_districts: 10
}

// Mock trend data (last 7 days)
export const generateMockTrendData = (): TrendData[] => {
  const data: TrendData[] = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    data.push({
      date: date.toISOString().split('T')[0],
      count: Math.floor(Math.random() * 30) + 10
    })
  }
  return data
}

// Mock vaccine stats
export const mockVaccineStats = [
  { vaccine_name: 'BCG', total_count: 320, week_count: 28, today_count: 5 },
  { vaccine_name: 'OPV', total_count: 450, week_count: 35, today_count: 6 },
  { vaccine_name: 'Hepatitis B', total_count: 280, week_count: 22, today_count: 4 },
  { vaccine_name: 'DPT', total_count: 350, week_count: 30, today_count: 5 },
  { vaccine_name: 'Measles', total_count: 150, week_count: 18, today_count: 3 },
  { vaccine_name: 'Rotavirus', total_count: 100, week_count: 10, today_count: 2 },
]

// Mock district stats
export const mockDistrictStats = [
  { district_name: 'Jaipur', target_population: 15000, total_vaccinations: 450, coverage_percentage: 3.0 },
  { district_name: 'Jodhpur', target_population: 12000, total_vaccinations: 380, coverage_percentage: 3.17 },
  { district_name: 'Udaipur', target_population: 10000, total_vaccinations: 320, coverage_percentage: 3.2 },
  { district_name: 'Kota', target_population: 8000, total_vaccinations: 250, coverage_percentage: 3.13 },
  { district_name: 'Ajmer', target_population: 7500, total_vaccinations: 250, coverage_percentage: 3.33 },
]

// Mock age group stats
export const mockAgeGroupStats: AgeGroupStats[] = [
  { age_group: '0-1 years', count: 520 },
  { age_group: '1-2 years', count: 450 },
  { age_group: '2-5 years', count: 480 },
  { age_group: '5+ years', count: 200 },
]

// Mock recent vaccinations
export const mockRecentVaccinations = [
  { id: '1', beneficiary_name: 'Rahul Sharma', vaccine_name: 'BCG', dose_number: 1, date_given: new Date().toISOString().split('T')[0], district_name: 'Jaipur', block_name: 'Block A' },
  { id: '2', beneficiary_name: 'Priya Meena', vaccine_name: 'OPV', dose_number: 2, date_given: new Date().toISOString().split('T')[0], district_name: 'Jodhpur', block_name: 'Block B' },
  { id: '3', beneficiary_name: 'Amit Kumar', vaccine_name: 'DPT', dose_number: 1, date_given: new Date(Date.now() - 86400000).toISOString().split('T')[0], district_name: 'Udaipur', block_name: 'Block A' },
  { id: '4', beneficiary_name: 'Sunita Devi', vaccine_name: 'Measles', dose_number: 1, date_given: new Date(Date.now() - 86400000).toISOString().split('T')[0], district_name: 'Kota', block_name: 'Block C' },
  { id: '5', beneficiary_name: 'Vikram Singh', vaccine_name: 'Hepatitis B', dose_number: 3, date_given: new Date(Date.now() - 172800000).toISOString().split('T')[0], district_name: 'Ajmer', block_name: 'Block B' },
]
