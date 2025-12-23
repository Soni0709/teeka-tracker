/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from './supabase'
import type { VaccineType } from '@/types'

// =============================================
// FILTER INTERFACE
// =============================================

export interface DashboardFilterParams {
  startDate?: string
  endDate?: string
  district_id?: string
  vaccine_type_id?: string
}

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

export async function getDashboardStats(filters?: DashboardFilterParams): Promise<DashboardSummary | null> {
  // If no filters, use the RPC function
  if (!filters || (!filters.startDate && !filters.district_id && !filters.vaccine_type_id)) {
    const { data, error } = await supabase.rpc('get_dashboard_stats')
    if (error) {
      console.error('Error fetching dashboard stats:', error)
      return null
    }
    return data as DashboardSummary
  }

  // With filters, calculate stats manually
  let query = supabase.from('vaccinations').select('id, date_given', { count: 'exact' })

  if (filters.startDate) {
    query = query.gte('date_given', filters.startDate)
  }
  if (filters.endDate) {
    query = query.lte('date_given', filters.endDate)
  }
  if (filters.district_id) {
    query = query.eq('district_id', filters.district_id)
  }
  if (filters.vaccine_type_id) {
    query = query.eq('vaccine_type_id', filters.vaccine_type_id)
  }

  const { data, count, error } = await query

  if (error) {
    console.error('Error fetching filtered stats:', error)
    return null
  }

  const today = new Date().toISOString().split('T')[0]
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const records = data || []
  const todayCount = records.filter((v: any) => v.date_given === today).length
  const weekCount = records.filter((v: any) => v.date_given >= weekAgo).length
  const monthCount = records.filter((v: any) => v.date_given >= monthAgo).length

  return {
    total_vaccinations: count || 0,
    today_count: todayCount,
    week_count: weekCount,
    month_count: monthCount,
    total_beneficiaries: 0,
    total_districts: 0
  }
}

// =============================================
// VACCINATION TREND (Time Series)
// =============================================

export interface TrendData {
  date: string
  count: number
}

export async function getVaccinationTrend(days: number = 7, filters?: DashboardFilterParams): Promise<TrendData[]> {
  // If no filters, use RPC
  if (!filters || (!filters.district_id && !filters.vaccine_type_id)) {
    const { data, error } = await supabase.rpc('get_vaccination_trend', { days_count: days })
    if (error) {
      console.error('Error fetching vaccination trend:', error)
      return []
    }
    return data || []
  }

  // With filters, calculate manually
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - (days - 1))

  let query = supabase
    .from('vaccinations')
    .select('date_given')
    .gte('date_given', startDate.toISOString().split('T')[0])
    .lte('date_given', endDate.toISOString().split('T')[0])

  if (filters.district_id) {
    query = query.eq('district_id', filters.district_id)
  }
  if (filters.vaccine_type_id) {
    query = query.eq('vaccine_type_id', filters.vaccine_type_id)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching filtered trend:', error)
    return []
  }

  // Group by date
  const countByDate: Record<string, number> = {}
  for (let i = 0; i < days; i++) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    countByDate[d.toISOString().split('T')[0]] = 0
  }

  const records = data || []
  records.forEach((v: any) => {
    if (countByDate[v.date_given] !== undefined) {
      countByDate[v.date_given]++
    }
  })

  return Object.entries(countByDate)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, count]) => ({ date, count }))
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

export async function getVaccinationByVaccineType(filters?: DashboardFilterParams): Promise<VaccineStats[]> {
  // If no filters, use view
  if (!filters || (!filters.startDate && !filters.district_id && !filters.vaccine_type_id)) {
    const { data, error } = await supabase
      .from('vaccination_stats_by_vaccine')
      .select('*')
    if (error) {
      console.error('Error fetching vaccine stats:', error)
      return []
    }
    return data || []
  }

  // With filters
  let query = supabase
    .from('vaccinations')
    .select('vaccine_type_id, date_given, vaccine_types!inner(name)')

  if (filters.startDate) query = query.gte('date_given', filters.startDate)
  if (filters.endDate) query = query.lte('date_given', filters.endDate)
  if (filters.district_id) query = query.eq('district_id', filters.district_id)
  if (filters.vaccine_type_id) query = query.eq('vaccine_type_id', filters.vaccine_type_id)

  const { data, error } = await query

  if (error) {
    console.error('Error fetching filtered vaccine stats:', error)
    return []
  }

  const today = new Date().toISOString().split('T')[0]
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  // Group by vaccine type
  const statsMap: Record<string, VaccineStats> = {}
  const records = data || []
  
  records.forEach((v: any) => {
    const name = v.vaccine_types?.name || 'Unknown'
    if (!statsMap[name]) {
      statsMap[name] = { vaccine_name: name, total_count: 0, week_count: 0, today_count: 0 }
    }
    statsMap[name].total_count++
    if (v.date_given >= weekAgo) statsMap[name].week_count++
    if (v.date_given === today) statsMap[name].today_count++
  })

  return Object.values(statsMap).sort((a, b) => b.total_count - a.total_count)
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

export async function getVaccinationByDistrict(filters?: DashboardFilterParams): Promise<DistrictStats[]> {
  // If no filters, use view
  if (!filters || (!filters.startDate && !filters.district_id && !filters.vaccine_type_id)) {
    const { data, error } = await supabase
      .from('vaccination_stats_by_district')
      .select('*')
    if (error) {
      console.error('Error fetching district stats:', error)
      return []
    }
    return data || []
  }

  // With filters
  let query = supabase
    .from('vaccinations')
    .select('district_id, districts!inner(name, target_population)')

  if (filters.startDate) query = query.gte('date_given', filters.startDate)
  if (filters.endDate) query = query.lte('date_given', filters.endDate)
  if (filters.district_id) query = query.eq('district_id', filters.district_id)
  if (filters.vaccine_type_id) query = query.eq('vaccine_type_id', filters.vaccine_type_id)

  const { data, error } = await query

  if (error) {
    console.error('Error fetching filtered district stats:', error)
    return []
  }

  // Group by district
  const statsMap: Record<string, DistrictStats> = {}
  const records = data || []
  
  records.forEach((v: any) => {
    const name = v.districts?.name || 'Unknown'
    const target = v.districts?.target_population || 0
    if (!statsMap[name]) {
      statsMap[name] = { 
        district_name: name, 
        target_population: target,
        total_vaccinations: 0, 
        coverage_percentage: 0 
      }
    }
    statsMap[name].total_vaccinations++
  })

  // Calculate coverage
  Object.values(statsMap).forEach(s => {
    s.coverage_percentage = s.target_population > 0 
      ? Math.round((s.total_vaccinations / s.target_population) * 10000) / 100 
      : 0
  })

  return Object.values(statsMap).sort((a, b) => b.total_vaccinations - a.total_vaccinations)
}

// =============================================
// VACCINATION BY AGE GROUP
// =============================================

export interface AgeGroupStats {
  age_group: string
  count: number
}

export async function getVaccinationByAgeGroup(filters?: DashboardFilterParams): Promise<AgeGroupStats[]> {
  // If no filters, use RPC
  if (!filters || (!filters.startDate && !filters.district_id && !filters.vaccine_type_id)) {
    const { data, error } = await supabase.rpc('get_vaccination_by_age_group')
    if (error) {
      console.error('Error fetching age group stats:', error)
      return []
    }
    return data || []
  }

  // With filters
  let query = supabase
    .from('vaccinations')
    .select('date_given, beneficiaries!inner(date_of_birth)')

  if (filters.startDate) query = query.gte('date_given', filters.startDate)
  if (filters.endDate) query = query.lte('date_given', filters.endDate)
  if (filters.district_id) query = query.eq('district_id', filters.district_id)
  if (filters.vaccine_type_id) query = query.eq('vaccine_type_id', filters.vaccine_type_id)

  const { data, error } = await query

  if (error) {
    console.error('Error fetching filtered age stats:', error)
    return []
  }

  // Calculate age groups
  const groups: Record<string, number> = { '0-1 years': 0, '1-2 years': 0, '2-5 years': 0, '5+ years': 0 }
  const today = new Date()
  const records = data || []

  records.forEach((v: any) => {
    const dob = new Date(v.beneficiaries?.date_of_birth)
    const ageYears = (today.getTime() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    
    if (ageYears < 1) groups['0-1 years']++
    else if (ageYears < 2) groups['1-2 years']++
    else if (ageYears < 5) groups['2-5 years']++
    else groups['5+ years']++
  })

  return Object.entries(groups).map(([age_group, count]) => ({ age_group, count }))
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

export async function getRecentVaccinations(limit: number = 10, filters?: DashboardFilterParams): Promise<RecentVaccination[]> {
  let query = supabase
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

  if (filters?.startDate) query = query.gte('date_given', filters.startDate)
  if (filters?.endDate) query = query.lte('date_given', filters.endDate)
  if (filters?.district_id) query = query.eq('district_id', filters.district_id)
  if (filters?.vaccine_type_id) query = query.eq('vaccine_type_id', filters.vaccine_type_id)

  query = query
    .order('date_given', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit)

  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching recent vaccinations:', error)
    return []
  }

  const records = data || []
  return records.map((item: any) => ({
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

  // Clean up empty strings - convert to null for UUID and optional fields
  const cleanData = {
    beneficiary_id: vaccination.beneficiary_id,
    vaccine_type_id: vaccination.vaccine_type_id,
    dose_number: vaccination.dose_number,
    date_given: vaccination.date_given,
    district_id: vaccination.district_id,
    block_id: vaccination.block_id || null,
    village: vaccination.village || null,
    batch_number: vaccination.batch_number || null,
    notes: vaccination.notes || null,
    administered_by: user.id
  }
  
  const { error } = await supabase
    .from('vaccinations')
    .insert(cleanData)
  
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

  // Clean up empty strings - convert to null for UUID fields
  const cleanData = {
    name: beneficiary.name,
    date_of_birth: beneficiary.date_of_birth,
    gender: beneficiary.gender,
    guardian_name: beneficiary.guardian_name || null,
    guardian_phone: beneficiary.guardian_phone || null,
    address: beneficiary.address || null,
    district_id: beneficiary.district_id,
    block_id: beneficiary.block_id || null,
    village: beneficiary.village || null,
    created_by: user.id
  }
  
  const { data, error } = await supabase
    .from('beneficiaries')
    .insert(cleanData)
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

  const records = data || []
  return records.map((item: any) => ({
    id: item.id,
    name: item.name,
    date_of_birth: item.date_of_birth,
    gender: item.gender,
    guardian_name: item.guardian_name || '',
    district_name: item.districts?.name || ''
  }))
}

// =============================================
// BENEFICIARIES - FULL CRUD
// =============================================

export interface BeneficiaryWithDetails {
  id: string
  name: string
  date_of_birth: string
  gender: 'male' | 'female' | 'other'
  guardian_name: string
  guardian_phone: string
  address: string
  district_id: string
  district_name: string
  block_id: string
  block_name: string
  village: string
  vaccination_count: number
  created_at: string
}

export interface BeneficiaryFilters {
  search?: string
  district_id?: string
  gender?: string
}

export interface PaginatedBeneficiaries {
  data: BeneficiaryWithDetails[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export async function getBeneficiaries(
  page: number = 1,
  pageSize: number = 10,
  filters?: BeneficiaryFilters
): Promise<PaginatedBeneficiaries> {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('beneficiaries')
    .select(`
      id,
      name,
      date_of_birth,
      gender,
      guardian_name,
      guardian_phone,
      address,
      district_id,
      block_id,
      village,
      created_at,
      districts(name),
      blocks(name)
    `, { count: 'exact' })

  // Apply filters
  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,guardian_name.ilike.%${filters.search}%,guardian_phone.ilike.%${filters.search}%`)
  }
  if (filters?.district_id) {
    query = query.eq('district_id', filters.district_id)
  }
  if (filters?.gender) {
    query = query.eq('gender', filters.gender)
  }

  query = query
    .order('created_at', { ascending: false })
    .range(from, to)

  const { data, count, error } = await query

  if (error) {
    console.error('Error fetching beneficiaries:', error)
    return { data: [], total: 0, page, pageSize, totalPages: 0 }
  }

  // Get vaccination counts
  const beneficiaryIds = (data || []).map((b: any) => b.id)
  let vaccinationCounts: Record<string, number> = {}

  if (beneficiaryIds.length > 0) {
    const { data: vaccinations } = await supabase
      .from('vaccinations')
      .select('beneficiary_id')
      .in('beneficiary_id', beneficiaryIds)

    if (vaccinations) {
      vaccinationCounts = vaccinations.reduce((acc: Record<string, number>, v: any) => {
        acc[v.beneficiary_id] = (acc[v.beneficiary_id] || 0) + 1
        return acc
      }, {})
    }
  }

  const records = (data || []).map((item: any) => ({
    id: item.id,
    name: item.name,
    date_of_birth: item.date_of_birth,
    gender: item.gender,
    guardian_name: item.guardian_name || '',
    guardian_phone: item.guardian_phone || '',
    address: item.address || '',
    district_id: item.district_id || '',
    district_name: item.districts?.name || '',
    block_id: item.block_id || '',
    block_name: item.blocks?.name || '',
    village: item.village || '',
    vaccination_count: vaccinationCounts[item.id] || 0,
    created_at: item.created_at
  }))

  const total = count || 0
  return {
    data: records,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize)
  }
}

export async function getBeneficiaryById(id: string): Promise<BeneficiaryWithDetails | null> {
  const { data, error } = await supabase
    .from('beneficiaries')
    .select(`
      id,
      name,
      date_of_birth,
      gender,
      guardian_name,
      guardian_phone,
      address,
      district_id,
      block_id,
      village,
      created_at,
      districts(name),
      blocks(name)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching beneficiary:', error)
    return null
  }

  // Get vaccination count
  const { count } = await supabase
    .from('vaccinations')
    .select('id', { count: 'exact', head: true })
    .eq('beneficiary_id', id)

  return {
    id: data.id,
    name: data.name,
    date_of_birth: data.date_of_birth,
    gender: data.gender,
    guardian_name: data.guardian_name || '',
    guardian_phone: data.guardian_phone || '',
    address: data.address || '',
    district_id: data.district_id || '',
    district_name: (data.districts as any)?.name || '',
    block_id: data.block_id || '',
    block_name: (data.blocks as any)?.name || '',
    village: data.village || '',
    vaccination_count: count || 0,
    created_at: data.created_at
  }
}

export async function updateBeneficiary(
  id: string,
  updates: Partial<NewBeneficiary>
): Promise<{ success: boolean; error?: string }> {
  // Clean up empty strings - convert to null for UUID and optional fields
  const cleanUpdates: Record<string, any> = {}
  
  if (updates.name !== undefined) cleanUpdates.name = updates.name
  if (updates.date_of_birth !== undefined) cleanUpdates.date_of_birth = updates.date_of_birth
  if (updates.gender !== undefined) cleanUpdates.gender = updates.gender
  if (updates.guardian_name !== undefined) cleanUpdates.guardian_name = updates.guardian_name || null
  if (updates.guardian_phone !== undefined) cleanUpdates.guardian_phone = updates.guardian_phone || null
  if (updates.address !== undefined) cleanUpdates.address = updates.address || null
  if (updates.district_id !== undefined) cleanUpdates.district_id = updates.district_id
  if (updates.block_id !== undefined) cleanUpdates.block_id = updates.block_id || null
  if (updates.village !== undefined) cleanUpdates.village = updates.village || null

  const { error } = await supabase
    .from('beneficiaries')
    .update(cleanUpdates)
    .eq('id', id)

  if (error) {
    console.error('Error updating beneficiary:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function deleteBeneficiary(id: string): Promise<{ success: boolean; error?: string }> {
  // Check if beneficiary has vaccinations
  const { count } = await supabase
    .from('vaccinations')
    .select('id', { count: 'exact', head: true })
    .eq('beneficiary_id', id)

  if (count && count > 0) {
    return { success: false, error: 'Cannot delete beneficiary with vaccination records' }
  }

  const { error } = await supabase
    .from('beneficiaries')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting beneficiary:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

// =============================================
// VACCINATIONS - FULL CRUD
// =============================================

export interface VaccinationWithDetails {
  id: string
  beneficiary_id: string
  beneficiary_name: string
  beneficiary_dob: string
  beneficiary_gender: string
  vaccine_type_id: string
  vaccine_name: string
  dose_number: number
  date_given: string
  district_id: string
  district_name: string
  block_id: string
  block_name: string
  village: string
  batch_number: string
  notes: string
  administered_by: string
  created_at: string
}

export interface VaccinationFilters {
  search?: string
  district_id?: string
  vaccine_type_id?: string
  start_date?: string
  end_date?: string
}

export interface PaginatedVaccinations {
  data: VaccinationWithDetails[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export async function getVaccinations(
  page: number = 1,
  pageSize: number = 10,
  filters?: VaccinationFilters
): Promise<PaginatedVaccinations> {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('vaccinations')
    .select(`
      id,
      beneficiary_id,
      vaccine_type_id,
      dose_number,
      date_given,
      district_id,
      block_id,
      village,
      batch_number,
      notes,
      administered_by,
      created_at,
      beneficiaries!inner(name, date_of_birth, gender),
      vaccine_types!inner(name),
      districts!inner(name),
      blocks(name)
    `, { count: 'exact' })

  // Apply filters
  if (filters?.search) {
    query = query.ilike('beneficiaries.name', `%${filters.search}%`)
  }
  if (filters?.district_id) {
    query = query.eq('district_id', filters.district_id)
  }
  if (filters?.vaccine_type_id) {
    query = query.eq('vaccine_type_id', filters.vaccine_type_id)
  }
  if (filters?.start_date) {
    query = query.gte('date_given', filters.start_date)
  }
  if (filters?.end_date) {
    query = query.lte('date_given', filters.end_date)
  }

  query = query
    .order('date_given', { ascending: false })
    .order('created_at', { ascending: false })
    .range(from, to)

  const { data, count, error } = await query

  if (error) {
    console.error('Error fetching vaccinations:', error)
    return { data: [], total: 0, page, pageSize, totalPages: 0 }
  }

  const records = (data || []).map((item: any) => ({
    id: item.id,
    beneficiary_id: item.beneficiary_id,
    beneficiary_name: item.beneficiaries?.name || '',
    beneficiary_dob: item.beneficiaries?.date_of_birth || '',
    beneficiary_gender: item.beneficiaries?.gender || '',
    vaccine_type_id: item.vaccine_type_id,
    vaccine_name: item.vaccine_types?.name || '',
    dose_number: item.dose_number,
    date_given: item.date_given,
    district_id: item.district_id || '',
    district_name: item.districts?.name || '',
    block_id: item.block_id || '',
    block_name: item.blocks?.name || '',
    village: item.village || '',
    batch_number: item.batch_number || '',
    notes: item.notes || '',
    administered_by: item.administered_by || '',
    created_at: item.created_at
  }))

  const total = count || 0
  return {
    data: records,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize)
  }
}

export async function getVaccinationById(id: string): Promise<VaccinationWithDetails | null> {
  const { data, error } = await supabase
    .from('vaccinations')
    .select(`
      id,
      beneficiary_id,
      vaccine_type_id,
      dose_number,
      date_given,
      district_id,
      block_id,
      village,
      batch_number,
      notes,
      administered_by,
      created_at,
      beneficiaries!inner(name, date_of_birth, gender),
      vaccine_types!inner(name),
      districts!inner(name),
      blocks(name)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching vaccination:', error)
    return null
  }

  return {
    id: data.id,
    beneficiary_id: data.beneficiary_id,
    beneficiary_name: (data.beneficiaries as any)?.name || '',
    beneficiary_dob: (data.beneficiaries as any)?.date_of_birth || '',
    beneficiary_gender: (data.beneficiaries as any)?.gender || '',
    vaccine_type_id: data.vaccine_type_id,
    vaccine_name: (data.vaccine_types as any)?.name || '',
    dose_number: data.dose_number,
    date_given: data.date_given,
    district_id: data.district_id || '',
    district_name: (data.districts as any)?.name || '',
    block_id: data.block_id || '',
    block_name: (data.blocks as any)?.name || '',
    village: data.village || '',
    batch_number: data.batch_number || '',
    notes: data.notes || '',
    administered_by: data.administered_by || '',
    created_at: data.created_at
  }
}

export async function deleteVaccination(id: string): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('vaccinations')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting vaccination:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}
