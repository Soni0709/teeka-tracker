-- =============================================
-- TeekaSetu Database Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. VACCINE TYPES TABLE
-- Stores all available vaccine types
CREATE TABLE IF NOT EXISTS vaccine_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  total_doses INTEGER NOT NULL DEFAULT 1,
  description TEXT,
  min_age_months INTEGER DEFAULT 0,
  max_age_months INTEGER DEFAULT 144,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. DISTRICTS TABLE
-- Stores district information
CREATE TABLE IF NOT EXISTS districts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  state VARCHAR(100) DEFAULT 'Rajasthan',
  target_population INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. BLOCKS TABLE
-- Stores block/tehsil information under districts
CREATE TABLE IF NOT EXISTS blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  district_id UUID REFERENCES districts(id) ON DELETE CASCADE,
  target_population INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name, district_id)
);

-- 4. USER PROFILES TABLE (if not exists)
-- Extends Supabase auth.users
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'health_worker')),
  district_id UUID REFERENCES districts(id),
  block_id UUID REFERENCES blocks(id),
  phone VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. BENEFICIARIES TABLE
-- Stores beneficiary (patient) information
CREATE TABLE IF NOT EXISTS beneficiaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender VARCHAR(10) NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  guardian_name VARCHAR(255),
  guardian_phone VARCHAR(20),
  address TEXT,
  district_id UUID REFERENCES districts(id),
  block_id UUID REFERENCES blocks(id),
  village VARCHAR(255),
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. VACCINATIONS TABLE
-- Core table storing vaccination records
CREATE TABLE IF NOT EXISTS vaccinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiary_id UUID REFERENCES beneficiaries(id) ON DELETE CASCADE,
  vaccine_type_id UUID REFERENCES vaccine_types(id),
  dose_number INTEGER NOT NULL DEFAULT 1,
  date_given DATE NOT NULL DEFAULT CURRENT_DATE,
  administered_by UUID REFERENCES user_profiles(id),
  district_id UUID REFERENCES districts(id),
  block_id UUID REFERENCES blocks(id),
  village VARCHAR(255),
  batch_number VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR BETTER QUERY PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_vaccinations_date ON vaccinations(date_given);
CREATE INDEX IF NOT EXISTS idx_vaccinations_district ON vaccinations(district_id);
CREATE INDEX IF NOT EXISTS idx_vaccinations_vaccine_type ON vaccinations(vaccine_type_id);
CREATE INDEX IF NOT EXISTS idx_vaccinations_administered_by ON vaccinations(administered_by);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_district ON beneficiaries(district_id);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_dob ON beneficiaries(date_of_birth);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE vaccine_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccinations ENABLE ROW LEVEL SECURITY;

-- Policies for vaccine_types (read for all authenticated)
CREATE POLICY "Anyone can read vaccine types" ON vaccine_types
  FOR SELECT TO authenticated USING (true);

-- Policies for districts (read for all authenticated)
CREATE POLICY "Anyone can read districts" ON districts
  FOR SELECT TO authenticated USING (true);

-- Policies for blocks (read for all authenticated)
CREATE POLICY "Anyone can read blocks" ON blocks
  FOR SELECT TO authenticated USING (true);

-- Policies for user_profiles
CREATE POLICY "Users can read own profile" ON user_profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Policies for beneficiaries (authenticated users can CRUD)
CREATE POLICY "Authenticated users can read beneficiaries" ON beneficiaries
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert beneficiaries" ON beneficiaries
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update beneficiaries" ON beneficiaries
  FOR UPDATE TO authenticated USING (true);

-- Policies for vaccinations (authenticated users can CRUD)
CREATE POLICY "Authenticated users can read vaccinations" ON vaccinations
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert vaccinations" ON vaccinations
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update vaccinations" ON vaccinations
  FOR UPDATE TO authenticated USING (true);

-- =============================================
-- VIEWS FOR DASHBOARD
-- =============================================

-- View: Vaccination stats by vaccine type
CREATE OR REPLACE VIEW vaccination_stats_by_vaccine AS
SELECT 
  vt.name as vaccine_name,
  COUNT(v.id) as total_count,
  COUNT(CASE WHEN v.date_given >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as week_count,
  COUNT(CASE WHEN v.date_given = CURRENT_DATE THEN 1 END) as today_count
FROM vaccine_types vt
LEFT JOIN vaccinations v ON v.vaccine_type_id = vt.id
GROUP BY vt.id, vt.name
ORDER BY total_count DESC;

-- View: Vaccination stats by district
CREATE OR REPLACE VIEW vaccination_stats_by_district AS
SELECT 
  d.name as district_name,
  d.target_population,
  COUNT(v.id) as total_vaccinations,
  ROUND((COUNT(v.id)::DECIMAL / NULLIF(d.target_population, 0)) * 100, 2) as coverage_percentage
FROM districts d
LEFT JOIN vaccinations v ON v.district_id = d.id
GROUP BY d.id, d.name, d.target_population
ORDER BY total_vaccinations DESC;

-- View: Daily vaccination counts (last 30 days)
CREATE OR REPLACE VIEW daily_vaccination_counts AS
SELECT 
  date_given,
  COUNT(*) as count
FROM vaccinations
WHERE date_given >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY date_given
ORDER BY date_given ASC;

-- =============================================
-- FUNCTIONS FOR DASHBOARD
-- =============================================

-- Function: Get dashboard summary stats
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_vaccinations', (SELECT COUNT(*) FROM vaccinations),
    'today_count', (SELECT COUNT(*) FROM vaccinations WHERE date_given = CURRENT_DATE),
    'week_count', (SELECT COUNT(*) FROM vaccinations WHERE date_given >= CURRENT_DATE - INTERVAL '7 days'),
    'month_count', (SELECT COUNT(*) FROM vaccinations WHERE date_given >= CURRENT_DATE - INTERVAL '30 days'),
    'total_beneficiaries', (SELECT COUNT(*) FROM beneficiaries),
    'total_districts', (SELECT COUNT(*) FROM districts)
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get vaccination trend (last N days)
CREATE OR REPLACE FUNCTION get_vaccination_trend(days_count INTEGER DEFAULT 7)
RETURNS TABLE (date DATE, count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d::DATE as date,
    COALESCE(COUNT(v.id), 0) as count
  FROM generate_series(
    CURRENT_DATE - (days_count - 1),
    CURRENT_DATE,
    '1 day'::INTERVAL
  ) d
  LEFT JOIN vaccinations v ON v.date_given = d::DATE
  GROUP BY d::DATE
  ORDER BY d::DATE ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get vaccination by age group
CREATE OR REPLACE FUNCTION get_vaccination_by_age_group()
RETURNS TABLE (age_group TEXT, count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE 
      WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, b.date_of_birth)) < 1 THEN '0-1 years'
      WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, b.date_of_birth)) < 2 THEN '1-2 years'
      WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, b.date_of_birth)) < 5 THEN '2-5 years'
      ELSE '5+ years'
    END as age_group,
    COUNT(v.id) as count
  FROM vaccinations v
  JOIN beneficiaries b ON v.beneficiary_id = b.id
  GROUP BY 
    CASE 
      WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, b.date_of_birth)) < 1 THEN '0-1 years'
      WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, b.date_of_birth)) < 2 THEN '1-2 years'
      WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, b.date_of_birth)) < 5 THEN '2-5 years'
      ELSE '5+ years'
    END
  ORDER BY age_group;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
