-- =============================================
-- TeekaSetu Seed Data
-- Run this AFTER 01_schema.sql
-- =============================================

-- 1. INSERT VACCINE TYPES
INSERT INTO vaccine_types (name, total_doses, description, min_age_months, max_age_months) VALUES
  ('BCG', 1, 'Bacillus Calmette-Guérin for tuberculosis', 0, 12),
  ('OPV', 5, 'Oral Polio Vaccine', 0, 60),
  ('Hepatitis B', 4, 'Hepatitis B vaccine', 0, 12),
  ('DPT', 5, 'Diphtheria, Pertussis, Tetanus', 6, 84),
  ('Measles', 2, 'Measles vaccine', 9, 60),
  ('Rotavirus', 3, 'Rotavirus vaccine', 6, 32),
  ('IPV', 2, 'Inactivated Polio Vaccine', 6, 14),
  ('Pentavalent', 3, 'DPT + Hep B + Hib', 6, 14),
  ('Vitamin A', 9, 'Vitamin A supplementation', 9, 60),
  ('JE', 2, 'Japanese Encephalitis', 9, 180)
ON CONFLICT (name) DO NOTHING;

-- 2. INSERT DISTRICTS (Rajasthan)
INSERT INTO districts (name, state, target_population) VALUES
  ('Jaipur', 'Rajasthan', 15000),
  ('Jodhpur', 'Rajasthan', 12000),
  ('Udaipur', 'Rajasthan', 10000),
  ('Kota', 'Rajasthan', 8000),
  ('Ajmer', 'Rajasthan', 7500),
  ('Bikaner', 'Rajasthan', 6500),
  ('Alwar', 'Rajasthan', 7000),
  ('Bharatpur', 'Rajasthan', 6000),
  ('Sikar', 'Rajasthan', 5500),
  ('Pali', 'Rajasthan', 5000)
ON CONFLICT (name) DO NOTHING;

-- 3. INSERT BLOCKS (3-4 blocks per district)
DO $$
DECLARE
  dist RECORD;
  block_names TEXT[] := ARRAY['Block A', 'Block B', 'Block C', 'Block D'];
  block_name TEXT;
BEGIN
  FOR dist IN SELECT id, name FROM districts LOOP
    FOREACH block_name IN ARRAY block_names LOOP
      INSERT INTO blocks (name, district_id, target_population)
      VALUES (
        dist.name || ' - ' || block_name,
        dist.id,
        1000 + floor(random() * 2000)::int
      )
      ON CONFLICT (name, district_id) DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

-- 4. INSERT BENEFICIARIES (500 sample beneficiaries)
DO $$
DECLARE
  first_names TEXT[] := ARRAY['Rahul', 'Priya', 'Amit', 'Sunita', 'Vikram', 'Anita', 'Rajesh', 'Kavita', 'Mohan', 'Geeta', 'Suresh', 'Meera', 'Arun', 'Suman', 'Ravi', 'Pooja', 'Deepak', 'Rekha', 'Manoj', 'Lata', 'Arjun', 'Neha', 'Kiran', 'Sanjay', 'Asha'];
  last_names TEXT[] := ARRAY['Sharma', 'Meena', 'Kumar', 'Devi', 'Singh', 'Kumari', 'Verma', 'Joshi', 'Lal', 'Rani', 'Yadav', 'Gupta', 'Patel', 'Jain', 'Agarwal'];
  genders TEXT[] := ARRAY['male', 'female'];
  villages TEXT[] := ARRAY['Rampur', 'Shyampur', 'Govindpur', 'Krishnapur', 'Lakshmipur', 'Sitapur', 'Narayanpur', 'Ganeshpur'];
  dist RECORD;
  blk RECORD;
  i INTEGER;
  random_dob DATE;
  full_name TEXT;
BEGIN
  FOR i IN 1..500 LOOP
    -- Select random district and block
    SELECT id INTO dist FROM districts ORDER BY random() LIMIT 1;
    SELECT id INTO blk FROM blocks WHERE district_id = dist.id ORDER BY random() LIMIT 1;
    
    -- Generate random DOB (0-5 years old)
    random_dob := CURRENT_DATE - (floor(random() * 1825)::int || ' days')::interval;
    
    -- Generate name
    full_name := first_names[1 + floor(random() * array_length(first_names, 1))::int] || ' ' ||
                 last_names[1 + floor(random() * array_length(last_names, 1))::int];
    
    INSERT INTO beneficiaries (
      name,
      date_of_birth,
      gender,
      guardian_name,
      guardian_phone,
      district_id,
      block_id,
      village
    ) VALUES (
      full_name,
      random_dob,
      genders[1 + floor(random() * 2)::int],
      'Guardian of ' || full_name,
      '98' || (10000000 + floor(random() * 89999999)::bigint)::text,
      dist.id,
      blk.id,
      villages[1 + floor(random() * array_length(villages, 1))::int]
    );
  END LOOP;
END $$;

-- 5. INSERT VACCINATIONS (1500 sample vaccination records over last 90 days)
DO $$
DECLARE
  ben RECORD;
  vac_type RECORD;
  random_date DATE;
  i INTEGER;
BEGIN
  FOR i IN 1..1500 LOOP
    -- Select random beneficiary
    SELECT id, district_id, block_id, village INTO ben 
    FROM beneficiaries ORDER BY random() LIMIT 1;
    
    -- Select random vaccine type
    SELECT id INTO vac_type FROM vaccine_types ORDER BY random() LIMIT 1;
    
    -- Random date in last 90 days
    random_date := CURRENT_DATE - (floor(random() * 90)::int || ' days')::interval;
    
    INSERT INTO vaccinations (
      beneficiary_id,
      vaccine_type_id,
      dose_number,
      date_given,
      district_id,
      block_id,
      village,
      batch_number
    ) VALUES (
      ben.id,
      vac_type.id,
      1 + floor(random() * 3)::int,
      random_date,
      ben.district_id,
      ben.block_id,
      ben.village,
      'BATCH-' || (2024000 + floor(random() * 999)::int)::text
    );
  END LOOP;
END $$;

-- 6. Add more vaccinations for today and recent days (to make stats interesting)
DO $$
DECLARE
  ben RECORD;
  vac_type RECORD;
  i INTEGER;
BEGIN
  -- Add 20-30 vaccinations for today
  FOR i IN 1..25 LOOP
    SELECT id, district_id, block_id, village INTO ben 
    FROM beneficiaries ORDER BY random() LIMIT 1;
    SELECT id INTO vac_type FROM vaccine_types ORDER BY random() LIMIT 1;
    
    INSERT INTO vaccinations (
      beneficiary_id, vaccine_type_id, dose_number, date_given,
      district_id, block_id, village, batch_number
    ) VALUES (
      ben.id, vac_type.id, 1, CURRENT_DATE,
      ben.district_id, ben.block_id, ben.village, 'BATCH-2024' || i::text
    );
  END LOOP;
  
  -- Add 15-20 vaccinations for yesterday
  FOR i IN 1..18 LOOP
    SELECT id, district_id, block_id, village INTO ben 
    FROM beneficiaries ORDER BY random() LIMIT 1;
    SELECT id INTO vac_type FROM vaccine_types ORDER BY random() LIMIT 1;
    
    INSERT INTO vaccinations (
      beneficiary_id, vaccine_type_id, dose_number, date_given,
      district_id, block_id, village, batch_number
    ) VALUES (
      ben.id, vac_type.id, 1, CURRENT_DATE - INTERVAL '1 day',
      ben.district_id, ben.block_id, ben.village, 'BATCH-2024Y' || i::text
    );
  END LOOP;
  
  -- Add vaccinations for last 7 days
  FOR i IN 1..100 LOOP
    SELECT id, district_id, block_id, village INTO ben 
    FROM beneficiaries ORDER BY random() LIMIT 1;
    SELECT id INTO vac_type FROM vaccine_types ORDER BY random() LIMIT 1;
    
    INSERT INTO vaccinations (
      beneficiary_id, vaccine_type_id, dose_number, date_given,
      district_id, block_id, village, batch_number
    ) VALUES (
      ben.id, vac_type.id, 1, CURRENT_DATE - (floor(random() * 7)::int || ' days')::interval,
      ben.district_id, ben.block_id, ben.village, 'BATCH-2024W' || i::text
    );
  END LOOP;
END $$;

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

-- Check counts
SELECT 'vaccine_types' as table_name, COUNT(*) as count FROM vaccine_types
UNION ALL
SELECT 'districts', COUNT(*) FROM districts
UNION ALL
SELECT 'blocks', COUNT(*) FROM blocks
UNION ALL
SELECT 'beneficiaries', COUNT(*) FROM beneficiaries
UNION ALL
SELECT 'vaccinations', COUNT(*) FROM vaccinations;

-- Check dashboard stats
SELECT * FROM get_dashboard_stats();

-- Check vaccination trend
SELECT * FROM get_vaccination_trend(7);

-- Check by vaccine type
SELECT * FROM vaccination_stats_by_vaccine;

-- Check by district
SELECT * FROM vaccination_stats_by_district;
