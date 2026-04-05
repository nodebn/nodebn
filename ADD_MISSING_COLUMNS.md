# Add Missing Columns to Subscriptions Table

The `subscriptions` table needs the `start_date` and `end_date` columns. Run this SQL in your Supabase SQL Editor:

```sql
-- Add the missing columns to existing subscriptions table
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS end_date TIMESTAMP WITH TIME ZONE;

-- Update existing records with default values if needed
UPDATE subscriptions 
SET start_date = created_at 
WHERE start_date IS NULL;

-- For active subscriptions without end_date, set 30 days from now
UPDATE subscriptions 
SET end_date = NOW() + INTERVAL '30 days' 
WHERE status = 'active' AND end_date IS NULL;
```

## ✅ **After Running**
The activation SQL will work:
```sql
UPDATE subscriptions
SET plan = 'professional', 
    status = 'active',
    start_date = NOW(), 
    end_date = NOW() + INTERVAL '30 days'
WHERE user_id = 'customer-user-id';
```

## 🔍 **Verify**
Check the table structure:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'subscriptions' 
ORDER BY ordinal_position;
```

Should show `start_date` and `end_date` columns.

The expiry function will now work with the date columns! ⏰

Run the ALTER TABLE command, then try your activation SQL again.</content>
<parameter name="filePath">C:\Users\Administrator\Documents\nodebn\ADD_MISSING_COLUMNS.md