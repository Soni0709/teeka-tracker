/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from './supabase'
import type { VaccineType } from '@/types'

// =============================================
// DASHBOARD STATS
// =============================================

export interface DashboardSummary {
  total_vaccinations: number
  today_count: number
  week_count: number
  month_count: number
  total_beneficiaries: number
  total_districts: number
}

export async function getDashboardStats(): Promise<DashboardSummary | null> {
  const { data, error } = await supabase.rpc('get_dashboard_stats')
  
  if (error) {
    console.error('Error fetching dashboard stats:', error)
    return null
  }
  
  return data as DashboardSummary
}

// =============================================
// VACCINATION TREND (Time Series)
// =============================================

export interface TrendData {
  date: string
  count: number
}

export async function getVaccinationTrend(days: number = 7): Promise<TrendData[]> {
  const { data, error } = await supabase.rpc('get_vaccination_trend', { days_count: days })
  
  if (error) {
    console.error('Error fetching vaccination trend:', error)
    return []
  }
  
  return data || []
}

// =============================================
// VACCINATION BY VACCINE TYPE
// =============================================

export interface VaccineStats {
  vaccine_name: string
  total_count: number
  week_count: number
  today_count: number
}

export async function getVaccinationByVaccineType(): Promise<VaccineStats[]> {
  const { data, error } = await supabase
    .from('vaccination_stats_by_vaccine')
    .select('*')
  
  if (error) {
    console.error('Error fetching vaccine stats:', error)
    return []
  }
  
  return data || []
}

// =============================================
// VACCINATION BY DISTRICT
// =============================================

export interface DistrictStats {
  district_name: string
  target_population: number
  total_vaccinations: number
  coverage_percentage: number
}

export async function getVaccinationByDistrict(): Promise<DistrictStats[]> {
  const { data, error } = await supabase
    .from('vaccination_stats_by_district')
    .select('*')
  
  if (error) {
    console.error('Error fetching district stats:', error)
    return []
  }
  
  return data || []
}

// =============================================
// VACCINATION BY AGE GROUP
// =============================================

export interface AgeGroupStats {
  age_group: string
  count: number
}

export async function getVaccinationByAgeGroup(): Promise<AgeGroupStats[]> {
  const { data, error } = await supabase.rpc('get_vaccination_by_age_group')
  
  if (error) {
    console.error('Error fetching age group stats:', error)
    return []
  }
  
  return data || []
}

// =============================================
// RECENT VACCINATIONS
// =============================================

export interface RecentVaccination {
  id: string
  beneficiary_name: string
  vaccine_name: string
  dose_number: number
  date_given: string
  district_name: string
  block_name: string
}

export async function getRecentVaccinations(limit: number = 10): Promise<RecentVaccination[]> {
  const { data, error } = await supabase
    .from('vaccinations')
    .select(`
      id,
      dose_number,
      date_given,
      beneficiaries!inner(name),
      vaccine_types!inner(name),
      districts!inner(name),
      blocks(name)
    `)
    .order('date_given', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) {
    console.error('Error fetching recent vaccinations:', error)
    return []
  }
  
  // Transform the data
  return (data || []).map((item: any) => ({
    id: item.id,
    beneficiary_name: item.beneficiaries?.name || 'Unknown',
    vaccine_name: item.vaccine_types?.name || 'Unknown',
    dose_number: item.dose_number,
    date_given: item.date_given,
    district_name: item.districts?.name || 'Unknown',
    block_name: item.blocks?.name || ''
  }))
}

// =============================================
// VACCINE TYPES (Master Data)
// =============================================

export async function getVaccineTypes(): Promise<VaccineType[]> {
  const { data, error } = await supabase
    .from('vaccine_types')
    .select('*')
    .order('name')
  
  if (error) {
    console.error('Error fetching vaccine types:', error)
    return []
  }
  
  return data || []
}

// =============================================
// DISTRICTS (Master Data)
// =============================================

export interface District {
  id: string
  name: string
  state: string
  target_population: number
}

export async function getDistricts(): Promise<District[]> {
  const { data, error } = await supabase
    .from('districts')
    .select('*')
    .order('name')
  
  if (error) {
    console.error('Error fetching districts:', error)
    return []
  }
  
  return data || []
}

// =============================================
// BLOCKS (Master Data)
// =============================================

export interface Block {
  id: string
  name: string
  district_id: string
  target_population: number
}

export async function getBlocks(districtId?: string): Promise<Block[]> {
  let query = supabase.from('blocks').select('*').order('name')
  
  if (districtId) {
    query = query.eq('district_id', districtId)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching blocks:', error)
    return []
  }
  
  return data || []
}

// =============================================
// ADD NEW VACCINATION
// =============================================

export interface NewVaccination {
  beneficiary_id: string
  vaccine_type_id: string
  dose_number: number
  date_given: string
  district_id: string
  block_id?: string
  village?: string
  batch_number?: string
  notes?: string
}

export async function addVaccination(vaccination: NewVaccination): Promise<{ success: boolean; error?: string }> {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'User not authenticated' }
  }
  
  const { error } = await supabase
    .from('vaccinations')
    .insert({
      ...vaccination,
      administered_by: user.id
    })
  
  if (error) {
    console.error('Error adding vaccination:', error)
    return { success: false, error: error.message }
  }
  
  return { success: true }
}

// =============================================
// ADD NEW BENEFICIARY
// =============================================

export interface NewBeneficiary {
  name: string
  date_of_birth: string
  gender: 'male' | 'female' | 'other'
  guardian_name?: string
  guardian_phone?: string
  address?: string
  district_id: string
  block_id?: string
  village?: string
}

export async function addBeneficiary(beneficiary: NewBeneficiary): Promise<{ success: boolean; id?: string; error?: string }> {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'User not authenticated' }
  }
  
  const { data, error } = await supabase
    .from('beneficiaries')
    .insert({
      ...beneficiary,
      created_by: user.id
    })
    .select('id')
    .single()
  
  if (error) {
    console.error('Error adding beneficiary:', error)
    return { success: false, error: error.message }
  }
  
  return { success: true, id: data.id }
}

// =============================================
// SEARCH BENEFICIARIES
// =============================================

export interface BeneficiarySearch {
  id: string
  name: string
  date_of_birth: string
  gender: string
  guardian_name: string
  district_name: string
}

export async function searchBeneficiaries(searchTerm: string): Promise<BeneficiarySearch[]> {
  const { data, error } = await supabase
    .from('beneficiaries')
    .select(`
      id,
      name,
      date_of_birth,
      gender,
      guardian_name,
      districts!inner(name)
    `)
    .ilike('name', `%${searchTerm}%`)
    .limit(20)
  
  if (error) {
    console.error('Error searching beneficiaries:', error)
    return []
  }
  
  return (data || []).map((item: any) => ({
    id: item.id,
    name: item.name,
    date_of_birth: item.date_of_birth,
    gender: item.gender,
    guardian_name: item.guardian_name || '',
    district_name: item.districts?.name || ''
  }))
}
