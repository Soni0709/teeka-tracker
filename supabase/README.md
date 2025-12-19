# TeekaSetu Database Setup Guide

## Step 1: Access Supabase SQL Editor

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** (left sidebar)

## Step 2: Run Schema Script

1. Open `supabase/01_schema.sql`
2. Copy the entire content
3. Paste in SQL Editor
4. Click **Run** (or Cmd/Ctrl + Enter)

This creates:
- 6 tables: `vaccine_types`, `districts`, `blocks`, `user_profiles`, `beneficiaries`, `vaccinations`
- Indexes for performance
- Row Level Security policies
- Views for dashboard stats
- Functions for dashboard APIs

## Step 3: Run Seed Data Script

1. Open `supabase/02_seed_data.sql`
2. Copy the entire content
3. Paste in SQL Editor (new query)
4. Click **Run**

This inserts:
- 10 vaccine types
- 10 districts (Rajasthan)
- 40 blocks (4 per district)
- 500 beneficiaries
- ~1650 vaccination records

## Step 4: Verify Data

Run these queries to verify:

```sql
-- Check table counts
SELECT 'vaccine_types' as table_name, COUNT(*) FROM vaccine_types
UNION ALL SELECT 'districts', COUNT(*) FROM districts
UNION ALL SELECT 'blocks', COUNT(*) FROM blocks
UNION ALL SELECT 'beneficiaries', COUNT(*) FROM beneficiaries
UNION ALL SELECT 'vaccinations', COUNT(*) FROM vaccinations;

-- Test dashboard stats function
SELECT * FROM get_dashboard_stats();

-- Test vaccination trend
SELECT * FROM get_vaccination_trend(7);

-- Check views
SELECT * FROM vaccination_stats_by_vaccine;
SELECT * FROM vaccination_stats_by_district;
```

## Step 5: Update User Profile Table (if needed)

If you already have a `user_profiles` table from auth setup, you may need to add columns:

```sql
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS district_id UUID REFERENCES districts(id),
ADD COLUMN IF NOT EXISTS block_id UUID REFERENCES blocks(id),
ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
```

## Troubleshooting

### "relation already exists" error
The schema uses `IF NOT EXISTS` so this shouldn't happen. If it does, the table already exists.

### "permission denied" error
Make sure RLS policies are created. Run the policy creation part of the schema again.

### No data showing
1. Check if seed data ran successfully
2. Verify you're logged in (RLS requires authentication)
3. Check browser console for API errors

## API Functions Available

| Function | Description |
|----------|-------------|
| `get_dashboard_stats()` | Returns summary stats (total, today, week, month) |
| `get_vaccination_trend(days)` | Returns daily counts for last N days |
| `get_vaccination_by_age_group()` | Returns vaccination counts by age group |

## Views Available

| View | Description |
|------|-------------|
| `vaccination_stats_by_vaccine` | Stats grouped by vaccine type |
| `vaccination_stats_by_district` | Stats grouped by district |
| `daily_vaccination_counts` | Daily counts for last 30 days |
